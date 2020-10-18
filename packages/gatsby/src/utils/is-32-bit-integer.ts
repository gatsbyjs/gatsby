export function is32BitInteger(x: unknown): boolean {
  return typeof x === `number` && (x | 0) === x
}
