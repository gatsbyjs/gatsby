const path = require(`path`)
const fs = require(`fs-extra`)

/**
 * Update Gatsby and React dependency versions in package.json of sites.
 * Adjust this script as needed, values are hardcoded.
 * @example node scripts/upgrade-deps.js
 */

const dir = `examples`
const reactVersion = `^18.2.0`

const moduleVersionMap = new Map([
  [`react`, reactVersion],
  [`react-dom`, reactVersion],
])

const cwd = process.cwd()
const gatsbyPackageDir = path.join(cwd, `packages`)
const absoluteDirPath = path.join(cwd, dir)

const gatsbyPackages = fs.readdirSync(gatsbyPackageDir)

for (const gatsbyPackage of gatsbyPackages) {
  moduleVersionMap.set(gatsbyPackage, `next`)
}

const sites = fs
  .readdirSync(absoluteDirPath, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(dirEnt => dirEnt.name)

for (const site of sites) {
  const packageJsonPath = path.join(absoluteDirPath, site, `package.json`)

  if (!fs.existsSync(packageJsonPath)) {
    console.info(`Skipping ${site}, no package.json found`)
    continue
  }

  const packageJson = fs.readFileSync(packageJsonPath, `utf8`)
  const parsedPackageJson = JSON.parse(packageJson)

  for (const [name, version] of moduleVersionMap) {
    if (parsedPackageJson.dependencies?.[name]) {
      parsedPackageJson.dependencies[name] = version
    }
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(parsedPackageJson, null, 2))

  console.info(`Updated ${site}`)
}
