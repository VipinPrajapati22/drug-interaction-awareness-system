import { env } from "../config/env.js";
import Drug from "../models/Drug.js";
import DrugInteraction from "../models/DrugInteraction.js";
import { getCacheDates, isFreshCache } from "../utils/cache.js";
import { nextId, store } from "./memoryStore.js";
import { fetchOpenFdaLabel } from "./openfda.service.js";
import { normalizeRxNormDrug, searchRxNormDrugs } from "./rxnorm.service.js";

const RXNAV_INTERACTION_BASE = "https://rxnav.nlm.nih.gov/REST/interaction";
const normalize = (value = "") => String(value).toLowerCase().trim();
const uniq = (items) => [...new Set(items.filter(Boolean))];
const escapeRegex = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const sentence = (value = "", max = 170) => {
  const clean = String(value).replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).replace(/\s+\S*$/, "")}.`;
};

const fetchJson = async (url) => {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`RxNav interaction request failed with ${response.status}`);
  return response.json();
};

const localDrugs = async () => env.mongoUri ? Drug.find({}).lean() : store.drugs;

const saveDrug = async (drug) => {
  const payload = { ...drug, ...getCacheDates() };
  if (env.mongoUri) {
    const lookup = [{ drugCode: payload.drugCode }, { drugName: new RegExp(`^${escapeRegex(payload.drugName)}$`, "i") }];
    if (payload.rxcui) lookup.unshift({ rxcui: payload.rxcui });
    return Drug.findOneAndUpdate(
      { $or: lookup },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();
  }

  const existingIndex = store.drugs.findIndex((item) => item.rxcui === payload.rxcui || normalize(item.drugName) === normalize(payload.drugName));
  if (existingIndex >= 0) {
    store.drugs[existingIndex] = { ...store.drugs[existingIndex], ...payload };
    return store.drugs[existingIndex];
  }
  const record = { _id: nextId("drug", store.drugs), ...payload };
  store.drugs.unshift(record);
  return record;
};

const findLocalDrug = async (query) => {
  const term = normalize(query);
  if (!term) return null;
  const drugs = await localDrugs();
  return drugs.find((drug) => {
    const names = [drug.drugName, drug.genericName, ...(drug.brandNames || []), ...(drug.synonymNames || []), drug.rxcui].map(normalize);
    return names.some((name) => name === term);
  });
};

const fuzzyLocalSearch = async (query, limit = 20) => {
  const term = normalize(query);
  const drugs = await localDrugs();
  return drugs
    .map((drug) => {
      const names = [drug.drugName, drug.genericName, ...(drug.brandNames || []), ...(drug.synonymNames || [])].map(normalize);
      const exact = names.some((name) => name === term) ? 100 : 0;
      const starts = names.some((name) => name.startsWith(term)) ? 70 : 0;
      const contains = names.some((name) => name.includes(term)) ? 40 : 0;
      return { drug, score: Math.max(exact, starts, contains) };
    })
    .filter((item) => !term || item.score > 0)
    .sort((a, b) => b.score - a.score || a.drug.drugName.localeCompare(b.drug.drugName))
    .slice(0, limit)
    .map((item) => item.drug);
};

export const resolveDrug = async (query, { forceRefresh = false } = {}) => {
  const local = await findLocalDrug(query);
  if (local && !forceRefresh && (!local.source || local.source === "seed" || local.source === "manual" || isFreshCache(local))) return local;

  const rxnorm = await normalizeRxNormDrug(query).catch(() => null);
  if (!rxnorm && local) return local;
  if (!rxnorm) return null;

  const fdaLabel = await fetchOpenFdaLabel({ query, rxcui: rxnorm.rxcui, rxnorm }).catch(() => null);
  const normalized = fdaLabel || {
    drugName: rxnorm.normalizedName,
    genericName: rxnorm.normalizedName,
    rxcui: rxnorm.rxcui,
    brandNames: rxnorm.brandNames || [],
    synonymNames: rxnorm.synonymNames || [],
    atcCode: "RXNORM",
    therapeuticClass: "RxNorm normalized drug",
    dosageForm: "See RxNorm",
    route: "See RxNorm",
    strength: "See RxNorm",
    manufacturer: "Not available from RxNorm",
    contraindications: [],
    indications: [],
    warnings: [],
    adverseReactions: [],
    boxedWarnings: [],
    pregnancyWarnings: [],
    renalWarnings: [],
    hepaticWarnings: [],
    drugInteractionsLabel: [],
    source: "openfda-rxnorm",
    drugCode: `RXCUI-${rxnorm.rxcui}`
  };

  return saveDrug(normalized);
};

export const globalDrugSearch = async (query, { limit = 20 } = {}) => {
  const local = await fuzzyLocalSearch(query, limit);
  if (!query || query.trim().length < 2) return local;

  const rxnorm = await searchRxNormDrugs(query).catch(() => []);
  const merged = [...local];
  rxnorm.forEach((item) => {
    if (!merged.some((drug) => normalize(drug.rxcui) === normalize(item.rxcui) || normalize(drug.drugName) === normalize(item.drugName))) {
      merged.push({
        _id: `rxnorm-${item.rxcui}`,
        drugName: item.drugName,
        genericName: item.synonym || item.drugName,
        rxcui: item.rxcui,
        source: "rxnorm",
        therapeuticClass: "RxNorm search result",
        brandNames: [],
        synonymNames: [item.synonym].filter(Boolean)
      });
    }
  });
  return merged.slice(0, limit);
};

const severityFromText = (text = "") => {
  const value = text.toLowerCase();
  if (/contraindicat|avoid|life-threatening|fatal/.test(value)) return "Contraindicated";
  if (/severe|serious|major|hemorrhage|hypotension|torsade/.test(value)) return "Severe";
  if (/monitor|caution|increase|decrease|risk/.test(value)) return "Moderate";
  return "Minor";
};

const normalizeRxNavPair = (pair, groupName, resolvedDrugs) => {
  const description = pair.description || pair.interactionConcept?.map((item) => item.sourceConceptItem?.name).join(" + ") || "Potential interaction found.";
  const concepts = pair.interactionConcept || [];
  const names = uniq(concepts.map((item) => item.sourceConceptItem?.name)).slice(0, 2);
  const rxcuis = uniq(concepts.map((item) => item.sourceConceptItem?.id));
  return {
    drugs: names.length >= 2 ? names : resolvedDrugs.map((drug) => drug.drugName),
    rxcuis,
    severity: severityFromText(description),
    mechanism: "RxNav interaction signal derived from normalized RxCUIs; review label details and patient-specific risk factors.",
    clinicalEffect: description,
    pharmacistRecommendation: "Assess indication, duplicate therapy, comorbidities, and safer alternatives before dispensing.",
    monitoringAdvice: "Monitor for the described clinical effect and document patient counseling.",
    source: "rxnav",
    interactionGroup: groupName || "RxNav interaction",
    rawDescription: description,
    ...getCacheDates()
  };
};

const saveInteractions = async (records) => {
  if (!records.length) return [];
  if (env.mongoUri) {
    const saved = [];
    for (const record of records) {
      const existing = await DrugInteraction.findOneAndUpdate(
        { rxcuis: { $all: record.rxcuis } },
        record,
        { new: true, upsert: true, setDefaultsOnInsert: true }
      ).lean();
      saved.push(existing);
    }
    return saved;
  }

  return records.map((record) => {
    const existingIndex = store.drugInteractions.findIndex((item) => record.rxcuis.length && record.rxcuis.every((rxcui) => item.rxcuis?.includes(rxcui)));
    if (existingIndex >= 0) {
      store.drugInteractions[existingIndex] = { ...store.drugInteractions[existingIndex], ...record };
      return store.drugInteractions[existingIndex];
    }
    const saved = { _id: nextId("ddi", store.drugInteractions), ...record };
    store.drugInteractions.unshift(saved);
    return saved;
  });
};

const localInteractionMatches = async (resolvedDrugs) => {
  const names = resolvedDrugs.map((drug) => normalize(drug.drugName));
  const rxcuis = resolvedDrugs.map((drug) => drug.rxcui).filter(Boolean);
  const interactions = env.mongoUri ? await DrugInteraction.find({}).lean() : store.drugInteractions;
  return interactions.filter((interaction) => {
    const byRxCui = interaction.rxcuis?.length >= 2 && interaction.rxcuis.every((rxcui) => rxcuis.includes(rxcui));
    const byName = interaction.drugs.map(normalize).every((name) => names.includes(name));
    return (byRxCui || byName) && (interaction.source !== "rxnav" || isFreshCache(interaction));
  });
};

const hasAny = (drug, terms) => {
  const text = normalize([
    drug.drugName,
    drug.genericName,
    drug.therapeuticClass,
    ...(drug.indications || []),
    ...(drug.contraindications || [])
  ].join(" "));
  return terms.some((term) => text.includes(term));
};

const makeRuleInteraction = (a, b, rule) => ({
  _id: `rule-${normalize(a.drugName)}-${normalize(b.drugName)}-${rule.key}`,
  drugs: [a.drugName, b.drugName],
  severity: rule.severity,
  mechanism: rule.mechanism,
  clinicalEffect: rule.effect,
  pharmacistRecommendation: rule.recommendation,
  monitoringAdvice: rule.monitoring,
  source: "clinical-rule",
  interactionGroup: "Clinical safety rules"
});

const clinicalInteractionRules = [
  {
    key: "bleeding",
    severity: "Severe",
    left: ["warfarin", "anticoagulant", "apixaban", "rivaroxaban"],
    right: ["aspirin", "antiplatelet", "clopidogrel", "nsaid", "ibuprofen", "ssri", "sertraline", "fluoxetine"],
    mechanism: "Additive effect on bleeding risk.",
    effect: "Higher risk of bruising, GI bleeding, or raised INR.",
    recommendation: "Avoid unnecessary combination; confirm indication.",
    monitoring: "Check bleeding symptoms, INR if on warfarin, Hb, and stool color."
  },
  {
    key: "nitrates-pde5",
    severity: "Contraindicated",
    left: ["sildenafil", "pde5"],
    right: ["nitroglycerin", "nitrate"],
    mechanism: "Both increase vasodilation.",
    effect: "Can cause dangerous hypotension or syncope.",
    recommendation: "Do not combine.",
    monitoring: "Urgent review if chest pain, dizziness, or fainting occurs."
  },
  {
    key: "renal-triple",
    severity: "Moderate",
    left: ["ace inhibitor", "arb", "enalapril", "losartan"],
    right: ["nsaid", "ibuprofen", "diuretic", "furosemide", "spironolactone"],
    mechanism: "Reduced renal perfusion or potassium imbalance.",
    effect: "Acute kidney injury, raised potassium, or loss of BP control.",
    recommendation: "Use shortest course and hydrate; avoid in kidney disease.",
    monitoring: "Check creatinine, potassium, BP, and swelling."
  },
  {
    key: "qt",
    severity: "Severe",
    left: ["amiodarone", "ondansetron", "domperidone", "azithromycin", "fluconazole"],
    right: ["amiodarone", "ondansetron", "domperidone", "azithromycin", "fluconazole", "ssri"],
    mechanism: "Additive QT prolongation risk.",
    effect: "Palpitations, dizziness, or serious arrhythmia.",
    recommendation: "Avoid multiple QT-risk drugs when possible.",
    monitoring: "Review ECG, potassium, magnesium, and cardiac history."
  },
  {
    key: "cns",
    severity: "Severe",
    left: ["tramadol", "opioid", "alprazolam", "benzodiazepine"],
    right: ["alprazolam", "benzodiazepine", "tramadol", "opioid", "antihistamine", "cetirizine"],
    mechanism: "Additive CNS and respiratory depression.",
    effect: "Excess sedation, falls, confusion, or breathing difficulty.",
    recommendation: "Avoid unsupervised use together.",
    monitoring: "Watch alertness, falls, breathing, and alcohol use."
  },
  {
    key: "hypoglycemia",
    severity: "Moderate",
    left: ["insulin", "glimepiride", "sulfonylurea", "antidiabetic"],
    right: ["insulin", "glimepiride", "sulfonylurea", "beta blocker", "bisoprolol"],
    mechanism: "Additive glucose lowering or masked symptoms.",
    effect: "Hypoglycemia; beta blockers may hide palpitations.",
    recommendation: "Counsel on meals and glucose monitoring.",
    monitoring: "Check blood glucose and sweating, confusion, tremor."
  },
  {
    key: "statin-inhibitor",
    severity: "Moderate",
    left: ["statin", "atorvastatin", "rosuvastatin"],
    right: ["azole", "ketoconazole", "fluconazole", "macrolide", "azithromycin", "amiodarone"],
    mechanism: "May increase statin exposure.",
    effect: "Muscle pain or rare rhabdomyolysis risk.",
    recommendation: "Consider temporary hold or alternative if high risk.",
    monitoring: "Ask about muscle pain; check CK if symptomatic."
  },
  {
    key: "warfarin-metabolism",
    severity: "Severe",
    left: ["warfarin"],
    right: ["amiodarone", "azole", "fluconazole", "ketoconazole", "antibiotic", "metronidazole", "ciprofloxacin"],
    mechanism: "Can increase warfarin effect.",
    effect: "Raised INR and bleeding risk.",
    recommendation: "Coordinate prescriber review and INR plan.",
    monitoring: "Check INR within a few days and counsel bleeding red flags."
  },
  {
    key: "digoxin",
    severity: "Severe",
    left: ["digoxin"],
    right: ["amiodarone", "diuretic", "furosemide", "spironolactone", "macrolide"],
    mechanism: "Digoxin level or electrolyte changes may increase toxicity.",
    effect: "Nausea, visual changes, bradycardia, or arrhythmia.",
    recommendation: "Review dose and renal function.",
    monitoring: "Check pulse, potassium, renal function, and digoxin level if needed."
  }
];

const ruleBasedInteractionMatches = (resolvedDrugs) => {
  const records = [];
  for (let i = 0; i < resolvedDrugs.length; i += 1) {
    for (let j = i + 1; j < resolvedDrugs.length; j += 1) {
      const a = resolvedDrugs[i];
      const b = resolvedDrugs[j];
      clinicalInteractionRules.forEach((rule) => {
        const forward = hasAny(a, rule.left) && hasAny(b, rule.right);
        const reverse = hasAny(a, rule.right) && hasAny(b, rule.left);
        const sameDrugOnly = normalize(a.drugName) === normalize(b.drugName);
        if ((forward || reverse) && !sameDrugOnly) records.push(makeRuleInteraction(a, b, rule));
      });
    }
  }
  return records.filter((item, index, arr) => index === arr.findIndex((candidate) => candidate._id === item._id));
};

export const checkInteractions = async ({ drugs = [], severity = "All" }) => {
  const resolvedDrugs = (await Promise.all(drugs.filter(Boolean).map((drug) => resolveDrug(drug)))).filter(Boolean);
  const local = await localInteractionMatches(resolvedDrugs);
  const rules = ruleBasedInteractionMatches(resolvedDrugs);

  const rxcuis = resolvedDrugs.map((drug) => drug.rxcui).filter(Boolean);
  let external = [];
  if (rxcuis.length >= 2 && !local.some((item) => item.source === "rxnav" && isFreshCache(item))) {
    const data = await fetchJson(`${RXNAV_INTERACTION_BASE}/list.json?rxcuis=${encodeURIComponent(rxcuis.join("+"))}`).catch(() => null);
    const groups = data?.fullInteractionTypeGroup || [];
    const records = groups.flatMap((group) =>
      (group.fullInteractionType || []).flatMap((type) =>
        (type.interactionPair || []).map((pair) => normalizeRxNavPair(pair, group.sourceName, resolvedDrugs))
      )
    );
    external = await saveInteractions(records);
  }

  const combined = [...local, ...external, ...rules];
  const deduped = combined.filter((item, index, arr) => index === arr.findIndex((candidate) => candidate.rawDescription === item.rawDescription && candidate.drugs.join("|") === item.drugs.join("|")));
  const filtered = severity === "All" ? deduped : deduped.filter((item) => item.severity === severity);
  const grouped = filtered.reduce((acc, item) => {
    const key = item.interactionGroup || item.source || "Local";
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});
  return { selectedDrugs: drugs, resolvedDrugs, count: filtered.length, results: filtered, grouped };
};

export const buildAdvancedCounselingWarnings = ({ medicines = [], patientProfile = {}, interactions = [], foodInteractions = [], resolvedDrugs = [] }) => {
  const warnings = interactions.map((item) => ({
    level: item.severity === "Contraindicated" || item.severity === "Severe" ? "red" : item.severity === "Moderate" ? "yellow" : "green",
    title: `${item.drugs.join(" + ")} interaction`,
    message: sentence(`${item.clinicalEffect} ${item.pharmacistRecommendation}`, 150)
  }));

  foodInteractions.forEach((item) => warnings.push({
    level: item.severity === "Severe" ? "red" : item.severity === "Moderate" ? "yellow" : "green",
    title: `${item.drug} with ${item.food}`,
    message: sentence(item.patientCounselingAdvice, 130)
  }));

  resolvedDrugs.forEach((drug) => {
    if (drug.boxedWarnings?.length) warnings.push({ level: "red", title: `${drug.drugName} black box warning`, message: sentence(drug.boxedWarnings[0], 130) });
    if (drug.pregnancyWarnings?.length || patientProfile.pregnancy) warnings.push({ level: patientProfile.pregnancy ? "red" : "yellow", title: `${drug.drugName} pregnancy`, message: sentence(drug.pregnancyWarnings?.[0] || "Confirm pregnancy safety before use.", 130) });
    if (drug.renalWarnings?.length || patientProfile.kidneyDisease) warnings.push({ level: patientProfile.kidneyDisease ? "red" : "yellow", title: `${drug.drugName} renal`, message: sentence(drug.renalWarnings?.[0] || "Check renal dose adjustment.", 120) });
    if (drug.hepaticWarnings?.length || patientProfile.liverDisease) warnings.push({ level: patientProfile.liverDisease ? "red" : "yellow", title: `${drug.drugName} hepatic`, message: sentence(drug.hepaticWarnings?.[0] || "Use caution in liver disease.", 120) });
    const alcoholText = [...(drug.warnings || []), ...(drug.drugInteractionsLabel || [])].find((text) => /alcohol/i.test(text));
    if (alcoholText) warnings.push({ level: "yellow", title: `${drug.drugName} alcohol`, message: sentence(alcoholText, 120) });
  });

  if (patientProfile.ageGroup === "elderly") warnings.push({ level: "yellow", title: "Elderly", message: "Check renal function, fall risk, sedation, and duplicate therapy." });
  if (patientProfile.ageGroup === "pediatric") warnings.push({ level: "yellow", title: "Pediatric", message: "Use weight-based dose and correct formulation." });
  if (patientProfile.selfMedication) warnings.push({ level: "red", title: "Self-medication", message: "Avoid mixing medicines, alcohol, or supplements without pharmacist review." });
  if (!warnings.length && medicines.length) warnings.push({ level: "green", title: "No major signal", message: "Use as directed and report unusual symptoms." });
  const rank = { red: 0, yellow: 1, green: 2 };
  return warnings
    .filter((item, index, arr) => index === arr.findIndex((candidate) => candidate.title === item.title && candidate.message === item.message))
    .sort((a, b) => rank[a.level] - rank[b.level])
    .slice(0, 8);
};
