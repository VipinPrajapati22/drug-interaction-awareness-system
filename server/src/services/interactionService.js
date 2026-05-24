const normalize = (value = "") => value.toLowerCase().trim();
const includesAny = (value = "", terms = []) => terms.some((term) => normalize(value).includes(term));

export const findDrugInteractions = (interactions, selectedDrugs = []) => {
  const wanted = selectedDrugs.map(normalize).filter(Boolean);
  return interactions.filter((interaction) => {
    const names = interaction.drugs.map(normalize);
    return names.every((name) => wanted.includes(name));
  });
};

export const findFoodInteractions = (interactions, drug = "", food = "") => {
  const drugTerm = normalize(drug);
  const foodTerm = normalize(food);
  const direct = interactions.filter((item) => {
    const drugMatch = normalize(item.drug).includes(drugTerm) || drugTerm.includes(normalize(item.drug));
    const foodMatch = !foodTerm || normalize(item.food).includes(foodTerm) || foodTerm.includes(normalize(item.food));
    return drugMatch && foodMatch;
  });
  const ruleMatches = foodRuleInteractions(drug, food);
  return [...direct, ...ruleMatches].filter((item, index, arr) =>
    index === arr.findIndex((candidate) => normalize(candidate.drug) === normalize(item.drug) && normalize(candidate.food) === normalize(item.food))
  );
};

const foodRuleInteractions = (drug = "", food = "") => {
  const d = normalize(drug);
  const f = normalize(food);
  const records = [];
  const add = (match, record) => {
    if ((!f || match.some((term) => f.includes(term))) && record.drug) records.push(record);
  };

  if (includesAny(d, ["metronidazole", "tinidazole", "linezolid", "tramadol", "alprazolam", "sertraline", "fluoxetine", "antihistamine", "cetirizine"])) {
    add(["alcohol", "beer", "wine", "spirits"], {
      drug,
      food: food || "Alcohol",
      severity: includesAny(d, ["metronidazole", "linezolid", "tramadol", "alprazolam"]) ? "Severe" : "Moderate",
      pharmacologyExplanation: "Alcohol can increase adverse effects or treatment intolerance.",
      riskMechanism: "Additive CNS depression, disulfiram-like reaction, or blood pressure/glucose effects.",
      patientCounselingAdvice: "Avoid alcohol during treatment unless the prescriber confirms it is safe."
    });
  }

  if (includesAny(d, ["aspirin", "ibuprofen", "nsaid", "warfarin", "antiplatelet", "anticoagulant"])) {
    add(["alcohol", "beer", "wine", "spirits"], {
      drug,
      food: food || "Alcohol",
      severity: includesAny(d, ["warfarin", "anticoagulant"]) ? "Severe" : "Moderate",
      pharmacologyExplanation: "Alcohol can irritate the stomach and increase bleeding risk.",
      riskMechanism: "Additive gastric irritation or impaired clotting may increase GI bleeding.",
      patientCounselingAdvice: "Avoid heavy alcohol; seek help for black stool, vomiting blood, or unusual bruising."
    });
  }

  if (includesAny(d, ["ciprofloxacin", "doxycycline", "tetracycline", "levothyroxine"])) {
    add(["dairy", "milk", "curd", "calcium", "iron", "antacid"], {
      drug,
      food: food || "Dairy, calcium, iron, or antacids",
      severity: "Moderate",
      pharmacologyExplanation: "Minerals can bind the medicine in the gut.",
      riskMechanism: "Reduced absorption may lower treatment effect.",
      patientCounselingAdvice: "Separate by 2-6 hours from dairy, calcium, iron, or antacids."
    });
  }

  if (includesAny(d, ["warfarin"])) {
    add(["vitamin k", "spinach", "leafy", "broccoli", "cabbage"], {
      drug,
      food: food || "Vitamin K rich foods",
      severity: "Moderate",
      pharmacologyExplanation: "Vitamin K intake changes warfarin effect.",
      riskMechanism: "INR may fall or become unstable.",
      patientCounselingAdvice: "Keep leafy green intake consistent; do not suddenly increase or stop."
    });
  }

  if (includesAny(d, ["atorvastatin", "simvastatin", "amlodipine", "carbamazepine", "amiodarone", "sildenafil"])) {
    add(["grapefruit", "grapefruit juice"], {
      drug,
      food: food || "Grapefruit juice",
      severity: "Moderate",
      pharmacologyExplanation: "Grapefruit may inhibit intestinal drug metabolism.",
      riskMechanism: "Drug levels can rise and increase adverse effects.",
      patientCounselingAdvice: "Avoid grapefruit unless the pharmacist confirms compatibility."
    });
  }

  if (includesAny(d, ["theophylline", "salbutamol", "caffeine"])) {
    add(["coffee", "tea", "caffeine", "energy drink"], {
      drug,
      food: food || "Caffeine",
      severity: "Minor",
      pharmacologyExplanation: "Stimulant effects can add up.",
      riskMechanism: "May increase tremor, palpitations, or nervousness.",
      patientCounselingAdvice: "Limit caffeine if tremor, palpitations, or insomnia occur."
    });
  }

  if (includesAny(d, ["levothyroxine", "bisphosphonate", "omeprazole"])) {
    add(["food", "meal", "breakfast", "high fiber"], {
      drug,
      food: food || "Meals or high-fiber foods",
      severity: "Minor",
      pharmacologyExplanation: "Food timing can alter absorption.",
      riskMechanism: "Delayed or reduced absorption may reduce effect.",
      patientCounselingAdvice: "Take consistently at the advised time, often before food."
    });
  }

  return records;
};

export const buildCounselingWarnings = ({ medicines = [], patientProfile = {}, interactions = [], foodInteractions = [] }) => {
  const warnings = interactions.map((item) => ({
    level: item.severity === "Contraindicated" || item.severity === "Severe" ? "red" : item.severity === "Moderate" ? "yellow" : "green",
    title: `${item.drugs.join(" + ")} interaction`,
    message: `${item.clinicalEffect} ${item.pharmacistRecommendation}`
  }));

  foodInteractions.forEach((item) => {
    warnings.push({
      level: item.severity === "Severe" ? "red" : item.severity === "Moderate" ? "yellow" : "green",
      title: `${item.drug} with ${item.food}`,
      message: item.patientCounselingAdvice
    });
  });

  if (patientProfile.pregnancy) warnings.push({ level: "red", title: "Pregnancy alert", message: "Avoid self-medication and confirm pregnancy safety before using any medicine." });
  if (patientProfile.ageGroup === "elderly") warnings.push({ level: "yellow", title: "Elderly precaution", message: "Start low, review renal function, fall risk, sedation, and duplicate therapy." });
  if (patientProfile.ageGroup === "pediatric") warnings.push({ level: "yellow", title: "Pediatric warning", message: "Dose must be based on age, weight, and formulation suitability." });
  if (patientProfile.selfMedication) warnings.push({ level: "red", title: "Self-medication warning", message: "Do not combine prescription medicines, painkillers, or antibiotics without pharmacist review." });
  if (!warnings.length && medicines.length) warnings.push({ level: "green", title: "No high-risk signal found", message: "Use medicines exactly as directed and report unexpected symptoms early." });
  return warnings;
};
