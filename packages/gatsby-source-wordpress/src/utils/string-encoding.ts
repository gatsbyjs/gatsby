// Base 64 encodes an input string.
export const b64e = (input: string): string =>
  Buffer.from(input).toString(`base64`)
