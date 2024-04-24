import { setDefaultTags } from "gatsby-telemetry";
import { getGatsbyVersion } from "gatsby-core-utils";

export function getLocalGatsbyVersion(): string {
  const version = getGatsbyVersion();

  try {
    setDefaultTags({ installedGatsbyVersion: version });
  } catch (e) {
    // ignore
  }

  return version;
}
