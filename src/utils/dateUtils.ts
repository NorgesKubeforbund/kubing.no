const formatCompDate = (startDate: string, endDate: string): string => {
  const compStart = new Date(startDate);
  const compEnd = new Date(endDate);
  let compDate = `${compStart.getDate()}. ${compStart.toLocaleDateString(
  "no-NB",
  { month: "short" }
  )}`;
  if (Date.parse(startDate) !== Date.parse(endDate)) {
    compDate += ` - ${compEnd.getDate()}. ${compEnd.toLocaleDateString(
      "no-NB",
      { month: "short" }
    )}`;
  }
  return compDate;
};
const isCacheValid = (cachedTimestamp: string, cacheDuration: number): boolean => {
  const cachedTime = parseInt(cachedTimestamp);
  return Date.now() - cachedTime < cacheDuration;
};
export { formatCompDate, isCacheValid };