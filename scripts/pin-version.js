const fs = require(`fs-extra`)
const path = require(`path`)

const packagesToPin = [
  `@gatsbyjs/parcel-namer-relative-to-cwd`,
  `gatsby-parcel-config`,
]

function adjustDeps(packageDirectoryPath) {
  const packageJsonPath = path.join(packageDirectoryPath, `package.json`)
  const packageJsonString = fs.readFileSync(packageJsonPath, `utf-8`)

  let updatedPackageJson = packageJsonString

  for (const packageToPin of packagesToPin) {
    const regexp = new RegExp(`"${packageToPin}": "\\^([^"]+)"`, `g`)

    updatedPackageJson = updatedPackageJson.replace(
      regexp,
      `"${packageToPin}": "$1"`
    )
  }

  if (updatedPackageJson !== packageJsonString) {
    fs.writeFileSync(packageJsonPath, updatedPackageJson)
  }
}

adjustDeps(process.cwd())
