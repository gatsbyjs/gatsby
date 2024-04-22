export function getValueAt(
  obj: Record<string, unknown>,
  selector: string | Array<string>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const selectors =
    typeof selector === `string` ? selector.split(`.`) : selector
  return get(obj, selectors)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function get(obj: unknown, selectors: Array<string>): any {
  if (typeof obj !== `object` || obj === null) {
    return undefined
  }
  if (Array.isArray(obj)) {
    return getArray(obj, selectors)
  }
  const [key, ...rest] = selectors
  const value = obj[key]
  if (!rest.length) {
    return value
  }
  if (Array.isArray(value)) {
    return getArray(value, rest)
  }
  if (value && typeof value === `object`) {
    return get(value, rest)
  }
  return undefined
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getArray(arr: Array<unknown>, selectors: Array<string>): Array<any> {
  return arr
    .map((value) => {
      return Array.isArray(value)
        ? getArray(value, selectors)
        : get(value, selectors)
    })
    .filter((v) => v !== undefined)
}
