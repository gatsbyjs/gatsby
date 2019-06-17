const { promisifiedSpawn } = require(`../utils/promisified-spawn`)
const { registryUrl } = require(`./verdaccio-config`)

const installPackages = async ({ packagesToInstall }) => {
  const installCmd = [
    `yarn`,
    [
      `add`,
      ...packagesToInstall.map(packageName => `${packageName}@gatsby-dev`),
      `--registry=${registryUrl}`,
      `--exact`,
    ],
  ]

  console.log(
    `Installing packages from local registry:\n${packagesToInstall
      .map(packageAndVersion => ` - ${packageAndVersion}`)
      .join(`\n`)}`
  )

  try {
    await promisifiedSpawn(installCmd)

    console.log(`Installation complete`)
  } catch {
    console.error(`Installation failed`)
  }
}

exports.installPackages = installPackages
