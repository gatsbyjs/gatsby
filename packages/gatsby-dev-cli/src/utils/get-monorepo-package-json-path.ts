import path from "node:path";

export function getMonorepoPackageJsonPath({
  packageName,
  packageNameToPath,
}): string {
  return path.join(packageNameToPath.get(packageName), "package.json");
}
