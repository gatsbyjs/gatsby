export function isGatsbyNodeLifecycleSupported(apiName: string): boolean {
  let availableAPIs
  try {
    availableAPIs = require(`gatsby/apis.json`)
  } catch (e) {
    throw new Error(
      `Couldn't check available APIs. Make sure you are on gatsby version >=2.13.41`
    )
  }

  return !!availableAPIs?.node?.[apiName]
}
