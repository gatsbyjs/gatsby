// @flow

const dotenv = require(`dotenv`)
const path = require(`path`)
const fs = require(`fs-extra`)
const reporter = require(`gatsby-cli/lib/reporter`)

async function getEnv(defaultNodeEnv: string): { [envKey: string]: string } {
  const env = process.env.NODE_ENV || defaultNodeEnv

  // FIXME: this should be program.directory yeah?
  const envFile = path.join(process.cwd(), `./.env.${env}`)

  let parsed = {}
  try {
    parsed = dotenv.parse(await fs.readFile(envFile, `utf8`))
  } catch (err) {
    if (err.code !== `ENOENT`) {
      reporter.panic(`Trouble parsing a .env file: ${envFile}`, err)
    }
  }

  const envObject = {}
  Object.entries(parsed).forEach(([key, value]) => {
    envObject[key] = JSON.stringify(value)
  })
  Object.entries(process.env).forEach(([key, value]) => {
    if (!key.match(/^GATSBY_/)) return
    envObject[key] = JSON.stringify(value)
  }, {})

  // Don't allow overwriting of NODE_ENV, PUBLIC_DIR as to not break gatsby things
  envObject.NODE_ENV = JSON.stringify(env)
  envObject.PUBLIC_DIR = JSON.stringify(`${process.cwd()}/public`)
}

module.exports = getEnv
