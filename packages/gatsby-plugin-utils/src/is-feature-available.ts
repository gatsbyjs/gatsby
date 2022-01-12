import type { AvailableFeatures } from "gatsby"

export function hasFeature(name: AvailableFeatures): boolean {
  try {
    const availableAPIs = require(`gatsby/apis.json`)

    return !!availableAPIs?.features?.includes(name)
  } catch (e) {
    throw new Error(
      `Couldn't check available APIs. Make sure you are on gatsby version >=2.13.41`
    )
  }
}
