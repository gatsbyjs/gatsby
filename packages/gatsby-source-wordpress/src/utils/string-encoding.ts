// Base 64 encodes an input string.
export function b64e(input: string): string {
  return Buffer.from(input).toString(`base64`)
}
