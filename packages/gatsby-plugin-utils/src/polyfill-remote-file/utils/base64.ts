export function base64URLEncode(str: string): string {
  return Buffer.from(str).toString(`base64url`)
}

export function base64URLDecode(str: string): string {
  return Buffer.from(str, `base64`).toString()
}
