import { last } from "es-toolkit/compat"

export const prepareRegex = (str: string): RegExp => {
  const exploded = str.split(`/`)
  const regex = new RegExp(exploded.slice(1, -1).join(`/`), last(exploded))
  return regex
}
