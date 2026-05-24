import { env } from "../config/env.js";

const OPENFDA_LABEL = "https://api.fda.gov/drug/label.json";

const first = (value) => Array.isArray(value) ? value[0] : value;
const arr = (value) => Array.isArray(value) ? value.filter(Boolean) : value ? [value] : [];

const fetchOpenFda = async (params) => {
  const url = new URL(OPENFDA_LABEL);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") url.searchParams.set(key, value);
  });
  if (env.openfdaApiKey) url.searchParams.set("api_key", env.openfdaApiKey);
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`openFDA request failed with ${response.status}`);
  return response.json();
};

const normalizeLabel = (label, rxnorm = {}) => {
  const openfda = label.openfda || {};
  const name = first(openfda.brand_name) || first(openfda.generic_name) || rxnorm.normalizedName || "Unknown drug";
  const generic = first(openfda.generic_name) || rxnorm.normalizedName || name;
  return {
    drugName: name,
    genericName: generic,
    rxcui: first(openfda.rxcui) || rxnorm.rxcui,
    brandNames: [...new Set([...arr(openfda.brand_name), ...(rxnorm.brandNames || [])])],
    synonymNames: [...new Set([...(rxnorm.synonymNames || []), ...arr(openfda.substance_name), ...arr(openfda.generic_name)])],
    atcCode: "RXNORM",
    therapeuticClass: first(openfda.pharm_class_epc) || first(openfda.pharm_class_cs) || "Externally sourced drug",
    dosageForm: first(openfda.dosage_form) || "See label",
    route: first(openfda.route) || "See label",
    strength: "See RxNorm label",
    manufacturer: first(openfda.manufacturer_name) || "Label manufacturer not available",
    contraindications: arr(label.contraindications),
    indications: arr(label.indications_and_usage),
    warnings: arr(label.warnings_and_cautions).concat(arr(label.warnings)),
    adverseReactions: arr(label.adverse_reactions),
    boxedWarnings: arr(label.boxed_warning),
    pregnancyWarnings: arr(label.pregnancy).concat(arr(label.use_in_specific_populations)),
    renalWarnings: arr(label.renal_impairment).concat(arr(label.use_in_specific_populations)).filter((text) => /renal|kidney/i.test(text)),
    hepaticWarnings: arr(label.hepatic_impairment).concat(arr(label.use_in_specific_populations)).filter((text) => /hepatic|liver/i.test(text)),
    drugInteractionsLabel: arr(label.drug_interactions),
    drugCode: `EXT-${first(openfda.rxcui) || rxnorm.rxcui || String(name).toUpperCase().replace(/[^A-Z0-9]/g, "-").slice(0, 40)}`,
    source: "openfda-rxnorm",
    externalIds: {
      splId: first(openfda.spl_id),
      setId: first(openfda.spl_set_id),
      productNdc: arr(openfda.product_ndc),
      packageNdc: arr(openfda.package_ndc)
    }
  };
};

export const fetchOpenFdaLabel = async ({ query, rxcui, rxnorm }) => {
  const searches = [
    rxcui ? `openfda.rxcui:${rxcui}` : "",
    query ? `openfda.generic_name:"${query}"` : "",
    query ? `openfda.brand_name:"${query}"` : ""
  ].filter(Boolean);

  for (const search of searches) {
    const data = await fetchOpenFda({ search, sort: "effective_time:desc", limit: "1" });
    const label = data?.results?.[0];
    if (label) return normalizeLabel(label, rxnorm);
  }
  return null;
};
