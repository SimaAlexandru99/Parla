export const getRingColor = (score: number): string => {
  if (score >= 80) return "#5cba23";
  if (score >= 60) return "#99d145";
  if (score >= 40) return "#eab80d";
  if (score >= 20) return "#e07f4a";
  return "#ca2b27";
};
