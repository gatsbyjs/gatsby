import crypto from "crypto"
import { getDataStore } from "../datastore"

export function generatePagesChecksum(): string {
  const hash = crypto.createHash(`md5`)

  try {
    for (const page of getDataStore().iterateNodesByType(`SitePage`)) {
      hash.update(page?.path as string)
    }
  } catch (e) {
    console.log(e)
  }
  return hash.digest(`hex`)
}
