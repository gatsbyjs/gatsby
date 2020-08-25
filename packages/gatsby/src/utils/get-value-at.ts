export function getValueAt(obj: object, selector: string | string[]): any {
  const selectors =
    typeof selector === `string` ? selector.split(`.`) : selector
  return get(obj, selectors)
}

function get(obj: unknown, selectors: string[]): any {
  if (typeof obj !== `object` || obj === null) return undefined
  if (Array.isArray(obj)) return getArray(obj, selectors)
  const [key, ...rest] = selectors
  const value = obj[key]
  if (!rest.length) return value
  if (Array.isArray(value)) return getArray(value, rest)
  if (value && typeof value === `object`) return get(value, rest)
  return undefined
}

function getArray(arr: unknown[], selectors: string[]): any[] {
  return arr
    .map(value =>
      Array.isArray(value) ? getArray(value, selectors) : get(value, selectors)
    )
    .filter(v => v !== undefined)
}
