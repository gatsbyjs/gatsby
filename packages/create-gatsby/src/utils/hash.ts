import crypto from "node:crypto";

export function sha256(str: string): string {
  return crypto.createHash("sha256").update(str).digest("hex");
}
export function md5(str: string): string {
  return crypto.createHash("md5").update(str).digest("hex");
}
