// Returns the difference of two dates in seconds, rounded by 2 decimal characters
// See: https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-only-if-necessary
export const getDurationInSeconds = startDate =>
  Math.round(((new Date() - startDate) / 1000 + Number.EPSILON) * 100) / 100
