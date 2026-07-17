export const trendText = (trend: number | null): string => {
  if (trend === null) return "—";
  if (trend === 0) return "● flat";
  return trend > 0 ? `▲ +${trend}%` : `▼ ${trend}%`;
};
