const normalize = (value = "") => value.toLowerCase().trim();

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
  return interactions.filter((item) => {
    const drugMatch = normalize(item.drug).includes(drugTerm) || drugTerm.includes(normalize(item.drug));
    const foodMatch = !foodTerm || normalize(item.food).includes(foodTerm) || foodTerm.includes(normalize(item.food));
    return drugMatch && foodMatch;
  });
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
