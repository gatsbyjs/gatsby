// eslint-disable-next-line @typescript-eslint/naming-convention
import _ from "lodash"

export function prepareRegex(str: string): RegExp {
  const exploded = str.split(`/`)
  const regex = new RegExp(exploded.slice(1, -1).join(`/`), _.last(exploded))
  return regex
}
