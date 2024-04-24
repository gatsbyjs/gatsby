import { getConfigStore } from "gatsby-core-utils";
import report from "../reporter";

type PackageManager = "npm" | "pnpm";

const packageMangerConfigKey = "cli.packageManager";

export function getPackageManager(): PackageManager {
  return getConfigStore().get(packageMangerConfigKey);
}

export function setPackageManager(packageManager: PackageManager): void {
  getConfigStore().set(packageMangerConfigKey, packageManager);
  report.info(`Preferred package manager set to "${packageManager}"`);
}
