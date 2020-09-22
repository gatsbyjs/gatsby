const path = require(`path`)
const execa = require(`execa`)
const fs = require(`fs-extra`)

module.exports = async () => {
  console.log(
    `Installing "gatsby-cli" in sandbox directory: "${process.env.GLOBAL_GATSBY_CLI_LOCATION}"`
  )
  console.log(
    `Tests will use "${process.env.GLOBAL_GATSBY_CLI_LOCATION}/node_modules/.bin/gatsby" CLI to invoke commands`
  )

  await fs.ensureDir(process.env.GLOBAL_GATSBY_CLI_LOCATION)

  await fs.outputJson(
    path.join(process.env.GLOBAL_GATSBY_CLI_LOCATION, `package.json`),
    {
      dependencies: {
        "gatsby-cli": "latest",
      },
    }
  )

  await execa(
    `gatsby-dev`,
    [
      `--packages`,
      `gatsby-cli`,
      `gatsby-recipes`,
      `gatsby-telemetry`,
      `--force-install`,
    ],
    { cwd: process.env.GLOBAL_GATSBY_CLI_LOCATION, stdio: `inherit` }
  )
}
