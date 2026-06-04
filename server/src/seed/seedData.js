const manufacturers = ["Cipla", "Sun Pharma", "Dr. Reddy's", "Pfizer", "Novartis", "GSK", "Torrent", "Lupin", "Aurobindo", "Abbott"];
const baseDrugs = [
  ["Warfarin", "Warfarin sodium", "B01AA03", "Anticoagulant", "Tablet", "Oral", "5 mg", ["Active bleeding", "Pregnancy"], ["Atrial fibrillation", "Venous thromboembolism"]],
  ["Aspirin", "Acetylsalicylic acid", "B01AC06", "Antiplatelet", "Enteric-coated tablet", "Oral", "75 mg", ["Peptic ulcer bleeding", "Aspirin hypersensitivity"], ["Secondary prevention of MI", "Pain"]],
  ["Sildenafil", "Sildenafil citrate", "G04BE03", "PDE5 inhibitor", "Tablet", "Oral", "50 mg", ["Nitrate therapy", "Severe hypotension"], ["Erectile dysfunction", "Pulmonary arterial hypertension"]],
  ["Nitroglycerin", "Glyceryl trinitrate", "C01DA02", "Organic nitrate", "Sublingual tablet", "Sublingual", "0.5 mg", ["PDE5 inhibitor use", "Severe anemia"], ["Angina", "Acute coronary syndrome"]],
  ["Ibuprofen", "Ibuprofen", "M01AE01", "NSAID", "Film-coated tablet", "Oral", "400 mg", ["Active GI bleeding", "Severe heart failure"], ["Pain", "Fever", "Inflammation"]],
  ["Enalapril", "Enalapril maleate", "C09AA02", "ACE inhibitor", "Tablet", "Oral", "5 mg", ["Pregnancy", "Angioedema history"], ["Hypertension", "Heart failure"]],
  ["Metronidazole", "Metronidazole", "J01XD01", "Antiprotozoal antibiotic", "Tablet", "Oral", "400 mg", ["Alcohol use", "First trimester caution"], ["Anaerobic infection", "Amoebiasis"]],
  ["Ciprofloxacin", "Ciprofloxacin hydrochloride", "J01MA02", "Fluoroquinolone antibiotic", "Film-coated tablet", "Oral", "500 mg", ["Tendon disorder history", "Tizanidine use"], ["UTI", "GI infection"]],
  ["Metformin", "Metformin hydrochloride", "A10BA02", "Biguanide", "Tablet", "Oral", "500 mg", ["Severe renal impairment", "Metabolic acidosis"], ["Type 2 diabetes"]],
  ["Atorvastatin", "Atorvastatin calcium", "C10AA05", "Statin", "Tablet", "Oral", "20 mg", ["Active liver disease", "Pregnancy"], ["Hyperlipidemia", "ASCVD prevention"]],
  ["Amlodipine", "Amlodipine besylate", "C08CA01", "Calcium channel blocker", "Tablet", "Oral", "5 mg", ["Severe hypotension"], ["Hypertension", "Angina"]],
  ["Losartan", "Losartan potassium", "C09CA01", "ARB", "Tablet", "Oral", "50 mg", ["Pregnancy"], ["Hypertension", "Diabetic nephropathy"]],
  ["Furosemide", "Furosemide", "C03CA01", "Loop diuretic", "Tablet", "Oral", "40 mg", ["Anuria", "Severe electrolyte depletion"], ["Edema", "Heart failure"]],
  ["Clopidogrel", "Clopidogrel bisulfate", "B01AC04", "Antiplatelet", "Tablet", "Oral", "75 mg", ["Active bleeding"], ["Stroke prevention", "ACS"]],
  ["Omeprazole", "Omeprazole", "A02BC01", "PPI", "Delayed-release capsule", "Oral", "20 mg", ["Hypersensitivity"], ["GERD", "Peptic ulcer disease"]],
  ["Pantoprazole", "Pantoprazole sodium", "A02BC02", "PPI", "Enteric-coated tablet", "Oral", "40 mg", ["Hypersensitivity"], ["GERD", "Erosive esophagitis"]],
  ["Azithromycin", "Azithromycin", "J01FA10", "Macrolide antibiotic", "Tablet", "Oral", "500 mg", ["Macrolide allergy", "Cholestatic jaundice history"], ["Respiratory infection", "Skin infection"]],
  ["Amoxicillin", "Amoxicillin trihydrate", "J01CA04", "Penicillin antibiotic", "Capsule", "Oral", "500 mg", ["Penicillin allergy"], ["ENT infection", "Respiratory infection"]],
  ["Doxycycline", "Doxycycline hyclate", "J01AA02", "Tetracycline antibiotic", "Capsule", "Oral", "100 mg", ["Pregnancy", "Children under 8 years"], ["Acne", "Respiratory infection"]],
  ["Levothyroxine", "Levothyroxine sodium", "H03AA01", "Thyroid hormone", "Tablet", "Oral", "50 mcg", ["Untreated thyrotoxicosis"], ["Hypothyroidism"]],
  ["Insulin glargine", "Insulin glargine", "A10AE04", "Long-acting insulin", "Solution for injection", "Subcutaneous", "100 U/mL", ["Hypoglycemia"], ["Diabetes mellitus"]],
  ["Glimepiride", "Glimepiride", "A10BB12", "Sulfonylurea", "Tablet", "Oral", "2 mg", ["Diabetic ketoacidosis", "Sulfonamide hypersensitivity"], ["Type 2 diabetes"]],
  ["Salbutamol", "Salbutamol sulfate", "R03AC02", "Beta-2 agonist", "Metered-dose inhaler", "Inhalation", "100 mcg/actuation", ["Hypersensitivity"], ["Asthma", "COPD bronchospasm"]],
  ["Montelukast", "Montelukast sodium", "R03DC03", "Leukotriene receptor antagonist", "Tablet", "Oral", "10 mg", ["Hypersensitivity"], ["Asthma prophylaxis", "Allergic rhinitis"]],
  ["Cetirizine", "Cetirizine hydrochloride", "R06AE07", "Antihistamine", "Tablet", "Oral", "10 mg", ["Severe renal impairment caution"], ["Allergic rhinitis", "Urticaria"]],
  ["Paracetamol", "Acetaminophen", "N02BE01", "Analgesic antipyretic", "Tablet", "Oral", "500 mg", ["Severe hepatic impairment"], ["Pain", "Fever"]],
  ["Tramadol", "Tramadol hydrochloride", "N02AX02", "Opioid analgesic", "Capsule", "Oral", "50 mg", ["MAOI use", "Severe respiratory depression"], ["Moderate to severe pain"]],
  ["Sertraline", "Sertraline hydrochloride", "N06AB06", "SSRI antidepressant", "Tablet", "Oral", "50 mg", ["MAOI use", "Pimozide use"], ["Depression", "Anxiety disorders"]],
  ["Fluoxetine", "Fluoxetine hydrochloride", "N06AB03", "SSRI antidepressant", "Capsule", "Oral", "20 mg", ["MAOI use"], ["Depression", "OCD"]],
  ["Alprazolam", "Alprazolam", "N05BA12", "Benzodiazepine", "Tablet", "Oral", "0.5 mg", ["Severe respiratory insufficiency", "Acute narrow-angle glaucoma"], ["Anxiety", "Panic disorder"]],
  ["Phenytoin", "Phenytoin sodium", "N03AB02", "Antiepileptic", "Extended-release capsule", "Oral", "100 mg", ["Sinus bradycardia", "Sinoatrial block"], ["Seizure disorder"]],
  ["Carbamazepine", "Carbamazepine", "N03AF01", "Antiepileptic", "Tablet", "Oral", "200 mg", ["Bone marrow depression", "MAOI use"], ["Epilepsy", "Trigeminal neuralgia"]],
  ["Prednisolone", "Prednisolone", "H02AB06", "Corticosteroid", "Tablet", "Oral", "10 mg", ["Systemic fungal infection"], ["Inflammatory disorders", "Allergy"]],
  ["Hydroxychloroquine", "Hydroxychloroquine sulfate", "P01BA02", "Antimalarial DMARD", "Tablet", "Oral", "200 mg", ["Retinopathy"], ["Rheumatoid arthritis", "Malaria"]],
  ["Allopurinol", "Allopurinol", "M04AA01", "Xanthine oxidase inhibitor", "Tablet", "Oral", "100 mg", ["Previous severe hypersensitivity"], ["Gout", "Hyperuricemia"]],
  ["Colchicine", "Colchicine", "M04AC01", "Anti-gout agent", "Tablet", "Oral", "0.5 mg", ["Severe renal and hepatic impairment"], ["Acute gout flare"]],
  ["Digoxin", "Digoxin", "C01AA05", "Cardiac glycoside", "Tablet", "Oral", "0.25 mg", ["Ventricular fibrillation"], ["Heart failure", "Atrial fibrillation"]],
  ["Amiodarone", "Amiodarone hydrochloride", "C01BD01", "Antiarrhythmic", "Tablet", "Oral", "200 mg", ["Severe sinus node dysfunction", "Iodine hypersensitivity"], ["Arrhythmia"]],
  ["Theophylline", "Theophylline", "R03DA04", "Methylxanthine bronchodilator", "Modified-release tablet", "Oral", "200 mg", ["Hypersensitivity"], ["Asthma", "COPD"]],
  ["Rifampicin", "Rifampicin", "J04AB02", "Rifamycin antibiotic", "Capsule", "Oral", "300 mg", ["Rifamycin hypersensitivity"], ["Tuberculosis"]],
  ["Isoniazid", "Isoniazid", "J04AC01", "Antitubercular", "Tablet", "Oral", "300 mg", ["Acute liver disease"], ["Tuberculosis"]],
  ["Fluconazole", "Fluconazole", "J02AC01", "Azole antifungal", "Capsule", "Oral", "150 mg", ["QT prolonging drug co-use caution"], ["Candidiasis"]],
  ["Ketoconazole", "Ketoconazole", "J02AB02", "Azole antifungal", "Tablet", "Oral", "200 mg", ["Acute or chronic liver disease"], ["Fungal infection"]],
  ["Ondansetron", "Ondansetron hydrochloride", "A04AA01", "5-HT3 antagonist", "Orally disintegrating tablet", "Oral", "4 mg", ["Congenital long QT syndrome"], ["Nausea", "Vomiting"]],
  ["Domperidone", "Domperidone", "A03FA03", "Prokinetic", "Tablet", "Oral", "10 mg", ["QT prolongation", "Moderate hepatic impairment"], ["Nausea", "Gastroparesis"]],
  ["Ranitidine", "Ranitidine", "A02BA02", "H2 receptor antagonist", "Tablet", "Oral", "150 mg", ["Hypersensitivity"], ["Acid reflux", "Peptic ulcer"]],
  ["Loratadine", "Loratadine", "R06AX13", "Antihistamine", "Tablet", "Oral", "10 mg", ["Hypersensitivity"], ["Allergic rhinitis"]],
  ["Rosuvastatin", "Rosuvastatin calcium", "C10AA07", "Statin", "Tablet", "Oral", "10 mg", ["Active liver disease", "Pregnancy"], ["Hyperlipidemia"]],
  ["Bisoprolol", "Bisoprolol fumarate", "C07AB07", "Beta blocker", "Tablet", "Oral", "5 mg", ["Severe bradycardia", "Cardiogenic shock"], ["Hypertension", "Heart failure"]],
  ["Spironolactone", "Spironolactone", "C03DA01", "Potassium-sparing diuretic", "Tablet", "Oral", "25 mg", ["Hyperkalemia", "Addison disease"], ["Heart failure", "Edema"]]
];

export const meddraTerms = [
  ["Blood and lymphatic system disorders", "Haemorrhage", "Bleeding tendency"],
  ["Cardiac disorders", "Hypotension", "Blood pressure decreased"],
  ["Gastrointestinal disorders", "Gastrointestinal haemorrhage", "Black stool"],
  ["Renal and urinary disorders", "Acute kidney injury", "Serum creatinine increased"],
  ["Nervous system disorders", "Dizziness", "Light headedness"],
  ["Hepatobiliary disorders", "Hepatic enzyme increased", "Transaminases increased"],
  ["Skin and subcutaneous tissue disorders", "Rash", "Pruritic rash"],
  ["Immune system disorders", "Anaphylactic reaction", "Acute allergic reaction"],
  ["Respiratory disorders", "Bronchospasm", "Wheezing"],
  ["Metabolism and nutrition disorders", "Hypoglycaemia", "Low blood sugar"],
  ["Musculoskeletal disorders", "Myalgia", "Muscle pain"],
  ["Psychiatric disorders", "Confusional state", "Mental confusion"],
  ["Eye disorders", "Vision blurred", "Blurred eyesight"],
  ["Ear and labyrinth disorders", "Vertigo", "Spinning sensation"],
  ["General disorders", "Drug ineffective", "Reduced therapeutic effect"],
  ["Infections and infestations", "Clostridium difficile colitis", "Antibiotic associated colitis"],
  ["Vascular disorders", "Hypertensive crisis", "Severe blood pressure increase"],
  ["Pregnancy conditions", "Foetal exposure during pregnancy", "Drug exposure in pregnancy"],
  ["Investigations", "International normalised ratio increased", "INR increased"],
  ["Endocrine disorders", "Adrenal suppression", "Steroid withdrawal effect"],
  ["Reproductive system disorders", "Erectile dysfunction", "Impotence"],
  ["Injury and poisoning", "Medication error", "Wrong self-medication"],
  ["Surgical and medical procedures", "Hospitalisation", "Admitted to hospital"],
  ["Product issues", "Product quality issue", "Tablet discoloration"],
  ["Social circumstances", "Intentional product misuse", "Self-medication misuse"]
].map(([soc, pt, llt], index) => ({ soc, pt, llt, code: `MEDDRA-${String(index + 1).padStart(5, "0")}` }));

export const drugs = Array.from({ length: 50 }, (_, index) => {
  const base = baseDrugs[index % baseDrugs.length];
  return {
    drugName: base[0],
    genericName: base[1],
    atcCode: base[2],
    therapeuticClass: base[3],
    dosageForm: base[4],
    route: base[5],
    strength: base[6],
    manufacturer: manufacturers[index % manufacturers.length],
    contraindications: base[7],
    indications: base[8],
    source: "seed",
    drugCode: `WHODD-IN-${String(index + 1).padStart(5, "0")}`
  };
});

const requiredInteractions = [
  ["Warfarin", "Aspirin", "Severe", "Additive anticoagulant and antiplatelet effect increases bleeding risk.", "Major bleeding, bruising, haematemesis, or raised INR.", "Avoid routine combination unless specialist indication exists; counsel on bleeding red flags.", "Check INR, stool occult blood, haemoglobin, and bleeding symptoms."],
  ["Sildenafil", "Nitroglycerin", "Contraindicated", "Both increase cyclic GMP causing profound vasodilation.", "Severe hypotension, syncope, myocardial ischemia.", "Do not dispense together; separate sildenafil and nitrates according to local protocol.", "Monitor blood pressure and urgent chest pain symptoms."],
  ["Ibuprofen", "Enalapril", "Moderate", "NSAID-mediated renal prostaglandin inhibition reduces ACE inhibitor renal perfusion benefit.", "Reduced antihypertensive response and acute kidney injury risk.", "Prefer paracetamol or short NSAID course with hydration advice.", "Check BP, serum creatinine, potassium, and edema."]
];

export const drugInteractions = [
  ...requiredInteractions,
  ...Array.from({ length: 27 }, (_, index) => {
    const a = drugs[(index + 6) % drugs.length].drugName;
    const b = drugs[(index + 17) % drugs.length].drugName;
    const severity = ["Minor", "Moderate", "Severe"][index % 3];
    return [
      a,
      b,
      severity,
      "Overlapping pharmacodynamic effects or altered metabolism may increase adverse reaction probability.",
      "Possible change in therapeutic response or adverse event frequency.",
      "Review dose timing, indication, renal function, and patient-specific risk before dispensing.",
      "Ask about symptoms, check relevant labs, and document counseling."
    ];
  })
].map(([a, b, severity, mechanism, clinicalEffect, pharmacistRecommendation, monitoringAdvice], index) => ({
  drugs: [a, b],
  severity,
  mechanism,
  clinicalEffect,
  pharmacistRecommendation,
  monitoringAdvice,
  meddraTerms: [meddraTerms[index % meddraTerms.length]],
  evidenceLevel: index < 3 ? "Established" : ["Theoretical", "Case report", "Observational"][index % 3]
}));

const requiredFood = [
  ["Metronidazole", "Alcohol", "Severe", "Alcohol exposure during therapy may trigger a disulfiram-like intolerance reaction.", "Aldehyde accumulation and gastrointestinal intolerance can occur.", "Avoid alcohol during treatment and for at least 48-72 hours after the last dose."],
  ["Ciprofloxacin", "Dairy products", "Moderate", "Calcium can bind ciprofloxacin in the gut and reduce absorption.", "Chelation lowers antibiotic bioavailability and may cause treatment failure.", "Take ciprofloxacin 2 hours before or 6 hours after milk, curd, calcium, or iron supplements."],
  ["Warfarin", "Vitamin K rich foods", "Moderate", "Large changes in vitamin K intake can alter warfarin anticoagulant effect.", "Inconsistent intake may lower or raise INR control.", "Keep leafy green intake consistent and report major diet changes before INR testing."]
];

export const foodInteractions = [
  ...requiredFood,
  ...Array.from({ length: 17 }, (_, index) => {
    const drug = drugs[(index + 8) % drugs.length].drugName;
    const foods = ["Grapefruit juice", "High-fat meal", "Caffeine", "Licorice", "Iron supplements", "Soy products"];
    return [
      drug,
      foods[index % foods.length],
      ["Minor", "Moderate", "Severe"][index % 3],
      "Food components may alter absorption, metabolism, or expected pharmacologic response.",
      "Timing, enzyme inhibition, or mineral binding can shift exposure.",
      "Use consistent meal timing and ask a pharmacist before combining supplements or special diets."
    ];
  })
].map(([drug, food, severity, pharmacologyExplanation, riskMechanism, patientCounselingAdvice]) => ({
  drug,
  food,
  severity,
  pharmacologyExplanation,
  riskMechanism,
  patientCounselingAdvice
}));

export const icsrReports = Array.from({ length: 15 }, (_, index) => ({
  icsrId: `ICSR-202605${String(10 + index).padStart(2, "0")}-MOCK${index + 1}`,
  patientAge: [19, 28, 35, 47, 62, 71][index % 6],
  gender: ["Female", "Male", "Unknown"][index % 3],
  suspectedDrug: drugs[index].drugName,
  concomitantDrugs: [drugs[(index + 4) % drugs.length].drugName],
  reactionDescription: ["Dizziness and nausea after self-medication", "Black stool and weakness", "Rash with itching", "Raised creatinine after analgesic use"][index % 4],
  seriousness: ["Non-serious", "Hospitalisation", "Medically significant"][index % 3],
  outcome: ["Recovered", "Recovering", "Unknown"][index % 3],
  reporterType: ["Patient", "Pharmacist", "Student"][index % 3],
  severityClassification: ["Minor", "Severe", "Moderate"][index % 3],
  meddraTerms: [meddraTerms[index % meddraTerms.length]]
}));

export const users = [
  { _id: "user-admin", name: "Admin Pharmacovigilance", email: "admin@dias.local", password: "Admin@123", role: "Admin", favorites: [], searchHistory: [] },
  { _id: "user-pharmacist", name: "Clinical Pharmacist", email: "pharmacist@dias.local", password: "Pharma@123", role: "Pharmacist", favorites: [], searchHistory: [] },
  { _id: "user-patient", name: "Demo User", email: "user@dias.local", password: "User@123", role: "User", favorites: [], searchHistory: [] }
];
