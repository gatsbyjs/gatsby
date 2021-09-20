import { readFileSync } from "fs-extra"

export function getDependencies(): {
  dependencies: Array<string> | undefined
  devDependencies: Array<string> | undefined
} {
  const data = parsePackageJson()

  return {
    dependencies: mapData(data?.dependencies),
    devDependencies: mapData(data?.devDependencies),
  }
}

function mapData(deps: Record<string, unknown>): Array<string> | undefined {
  if (!deps) {
    return undefined
  }
  return Object.entries(deps)
    .map(([name, version]) => {
      return {
        name,
        version,
      }
    })
    .map(({ name, version }) => `${name}@${version}`)
}

function parsePackageJson(): {
  dependencies: Record<string, unknown>
  devDependencies: Record<string, unknown>
} {
  try {
    const packageJson = readFileSync(`./package.json`, `utf8`)
    if (!packageJson) {
      return { dependencies: {}, devDependencies: {} }
    }
    return JSON.parse(packageJson)
  } catch (e) {
    return { dependencies: {}, devDependencies: {} }
  }
}
