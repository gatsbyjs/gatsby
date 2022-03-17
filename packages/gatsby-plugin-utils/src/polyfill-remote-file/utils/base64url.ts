export function base64EncodeURL(str: string): string {
  return Buffer.from(str).toString(`base64`)
}
