const RXNAV_BASE = "https://rxnav.nlm.nih.gov/REST";

const fetchJson = async (url) => {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`RxNorm request failed with ${response.status}`);
  return response.json();
};

const pickConcepts = (data) => data?.approximateGroup?.candidate || [];

export const normalizeRxNormDrug = async (query) => {
  const url = `${RXNAV_BASE}/approximateTerm.json?term=${encodeURIComponent(query)}&maxEntries=8`;
  const data = await fetchJson(url);
  const concepts = pickConcepts(data).filter((item) => item.rxcui);
  if (!concepts.length) return null;

  const best = concepts[0];
  const [properties, related] = await Promise.all([
    fetchJson(`${RXNAV_BASE}/rxcui/${best.rxcui}/properties.json`).catch(() => null),
    fetchJson(`${RXNAV_BASE}/rxcui/${best.rxcui}/related.json?tty=BN+IN+SCD+SBD`).catch(() => null)
  ]);

  const relatedConcepts = related?.relatedGroup?.conceptGroup?.flatMap((group) => group.conceptProperties || []) || [];
  const brandNames = [...new Set(relatedConcepts.filter((item) => item.tty === "BN" || item.tty === "SBD").map((item) => item.name))].slice(0, 12);
  const synonymNames = [...new Set(relatedConcepts.map((item) => item.name).filter(Boolean))].slice(0, 25);

  return {
    rxcui: best.rxcui,
    normalizedName: properties?.properties?.name || best.rxaui || query,
    synonymNames,
    brandNames,
    candidates: concepts.map((item) => ({ rxcui: item.rxcui, score: item.score, rank: item.rank }))
  };
};

export const searchRxNormDrugs = async (query) => {
  const data = await fetchJson(`${RXNAV_BASE}/drugs.json?name=${encodeURIComponent(query)}`);
  const groups = data?.drugGroup?.conceptGroup || [];
  return groups.flatMap((group) => group.conceptProperties || []).map((item) => ({
    rxcui: item.rxcui,
    drugName: item.name,
    synonym: item.synonym,
    tty: item.tty,
    source: "rxnorm"
  }));
};
