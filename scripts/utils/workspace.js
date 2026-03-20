const fs = require(`fs`)
const path = require(`path`)
const { execFileSync } = require(`child_process`)

const DEPENDENCY_FIELDS = [
  `dependencies`,
  `devDependencies`,
  `peerDependencies`,
  `optionalDependencies`,
]

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, `utf8`))
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + `\n`)
}

function stripWorkspaceProtocol(spec) {
  return typeof spec === `string` && spec.startsWith(`workspace:`)
    ? spec.slice(`workspace:`.length)
    : spec
}

function restoreWorkspaceProtocol(originalSpec, nextSpec) {
  return typeof originalSpec === `string` &&
    originalSpec.startsWith(`workspace:`)
    ? `workspace:${nextSpec}`
    : nextSpec
}

function getWorkspacePatterns(rootDir = process.cwd()) {
  const manifest = readJson(path.join(rootDir, `package.json`))
  const { workspaces = [] } = manifest

  if (Array.isArray(workspaces)) {
    return workspaces
  }

  if (Array.isArray(workspaces.packages)) {
    return workspaces.packages
  }

  return []
}

function expandWorkspacePattern(pattern, rootDir) {
  if (!pattern.endsWith(`/*`)) {
    throw new Error(`Unsupported workspace pattern: ${pattern}`)
  }

  const baseDir = pattern.slice(0, -2)
  const absoluteBaseDir = path.join(rootDir, baseDir)

  if (!fs.existsSync(absoluteBaseDir)) {
    return []
  }

  return fs
    .readdirSync(absoluteBaseDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => path.join(baseDir, dirent.name))
}

function getWorkspacePackages(rootDir = process.cwd()) {
  const locations = new Set()

  for (const pattern of getWorkspacePatterns(rootDir)) {
    for (const location of expandWorkspacePattern(pattern, rootDir)) {
      locations.add(location)
    }
  }

  return Array.from(locations)
    .sort()
    .map(relativeLocation => {
      const packageJsonPath = path.join(
        rootDir,
        relativeLocation,
        `package.json`
      )
      const packageJson = readJson(packageJsonPath)

      return {
        name: packageJson.name || path.basename(relativeLocation),
        dirName: path.basename(relativeLocation),
        location: path.join(rootDir, relativeLocation),
        relativeLocation,
        packageJsonPath,
        packageJson,
        private: Boolean(packageJson.private),
        version: packageJson.version,
        scripts: packageJson.scripts || {},
      }
    })
}

function getWorkspacePackageMap(packages) {
  return new Map(packages.map(pkg => [pkg.name, pkg]))
}

function getLocalDependencyNames(pkg, packageMap) {
  const deps = new Set()

  for (const field of DEPENDENCY_FIELDS) {
    for (const depName of Object.keys(pkg.packageJson[field] || {})) {
      if (packageMap.has(depName)) {
        deps.add(depName)
      }
    }
  }

  return Array.from(deps).sort()
}

function expandBracePattern(pattern) {
  if (!pattern.includes(`{`) || !pattern.includes(`}`)) {
    return [pattern]
  }

  const match = pattern.match(/^(.*)\{([^{}]+)\}(.*)$/)
  if (!match) {
    return [pattern]
  }

  const [, prefix, body, suffix] = match
  return body
    .split(`,`)
    .flatMap(part => expandBracePattern(`${prefix}${part}${suffix}`))
}

function wildcardToRegExp(pattern) {
  const escaped = pattern.replace(/[|\\{}()[\]^$+?.]/g, `\\$&`)
  const regex = `^${escaped.replace(/\*/g, `.*`)}$`
  return new RegExp(regex)
}

function packageMatchesPattern(pkg, pattern) {
  const values = [
    pkg.name,
    pkg.dirName,
    pkg.relativeLocation,
    `./${pkg.relativeLocation}`,
  ]

  return expandBracePattern(pattern).some(expandedPattern => {
    const matcher = wildcardToRegExp(expandedPattern)
    return values.some(value => matcher.test(value))
  })
}

function selectWorkspacePackages(packages, { scope = [], ignore = [] } = {}) {
  const scopedPackages =
    scope.length > 0
      ? packages.filter(pkg =>
          scope.some(scopePattern => packageMatchesPattern(pkg, scopePattern))
        )
      : packages

  if (ignore.length === 0) {
    return scopedPackages
  }

  return scopedPackages.filter(
    pkg =>
      !ignore.some(ignorePattern => packageMatchesPattern(pkg, ignorePattern))
  )
}

function getLatestPackageTag(packageName, rootDir = process.cwd()) {
  try {
    return execFileSync(
      `git`,
      [`describe`, `--abbrev=0`, `--match`, `${packageName}@*`],
      { cwd: rootDir, encoding: `utf8`, stdio: [`ignore`, `pipe`, `ignore`] }
    ).trim()
  } catch {
    return null
  }
}

function packageChangedSinceTag(pkg, tag, rootDir = process.cwd()) {
  if (!tag) {
    return true
  }

  try {
    execFileSync(`git`, [`diff`, `--quiet`, tag, `--`, pkg.relativeLocation], {
      cwd: rootDir,
      stdio: `ignore`,
    })
    return false
  } catch (error) {
    if (typeof error.status === `number`) {
      return error.status === 1
    }
    throw error
  }
}

function getChangedWorkspacePackages(packages, rootDir = process.cwd()) {
  return packages.filter(pkg =>
    packageChangedSinceTag(pkg, getLatestPackageTag(pkg.name, rootDir), rootDir)
  )
}

module.exports = {
  getChangedWorkspacePackages,
  getWorkspacePackageMap,
  getWorkspacePackages,
  restoreWorkspaceProtocol,
  selectWorkspacePackages,
  stripWorkspaceProtocol,
  writeJson,
}
