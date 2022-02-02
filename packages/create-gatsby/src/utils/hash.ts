import crypto from "crypto"

export const sha256 = (str: string): string =>
  crypto.createHash(`sha256`).update(str).digest(`hex`)
export const md5 = (str: string): string =>
  crypto.createHash(`md5`).update(str).digest(`hex`)
