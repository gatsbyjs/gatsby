import { version as devCliVersion } from "../../package.json";

export function getVersionInfo(): string {
  return `Gatsby Dev CLI version: ${devCliVersion}`;
}
