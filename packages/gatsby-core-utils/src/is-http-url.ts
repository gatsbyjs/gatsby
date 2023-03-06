import { URL } from "url"

export function isHttpUrl(value: string): boolean {
  let url: URL

  try {
    url = new URL(value)
  } catch (error) {
    return false
  }

  return url.protocol === `http:` || url.protocol === `https:`
}
