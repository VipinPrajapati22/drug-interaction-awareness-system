export const makeIcsrId = () => {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ICSR-${date}-${random}`;
};

export const classifySeverity = (seriousness = "", description = "") => {
  const text = `${seriousness} ${description}`.toLowerCase();
  if (text.includes("death") || text.includes("life") || text.includes("hospital")) return "Severe";
  if (text.includes("disability") || text.includes("congenital")) return "Moderate";
  if (text.includes("serious")) return "Moderate";
  return "Minor";
};
