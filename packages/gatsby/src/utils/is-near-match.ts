import { distance as levenshtein } from "fastest-levenshtein"

export function isNearMatch(
  fileName: string | undefined,
  configName: string,
  distance: number
): boolean {
  if (!fileName) return false
  return levenshtein(fileName, configName) <= distance
}
