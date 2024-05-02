// import type { AvailableFeatures } from "gatsby";

/**
 * Check the readme for a list of available features.
 */
export function hasFeature(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  name: any, // AvailableFeatures
): boolean {
  try {
    const availableAPIs = require("gatsby/apis.json");

    return !!availableAPIs?.features?.includes(name);
  } catch (e) {
    throw new Error(
      "Couldn't check available APIs. Make sure you are on gatsby version >=2.13.41",
    );
  }
}
