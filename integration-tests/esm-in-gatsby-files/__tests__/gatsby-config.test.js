import path from "path"
import fs from "fs-extra"
import execa from "execa"

jest.setTimeout(100000)

const fixtureRoot = path.resolve(__dirname, `fixtures`)
const siteRoot = path.resolve(__dirname, `..`)

const fixturePath = {
  cjs: path.join(fixtureRoot, `gatsby-config.js`),
  esm: path.join(fixtureRoot, `gatsby-config.mjs`),
}

const configPath = {
  cjs: path.join(siteRoot, `gatsby-config.js`),
  esm: path.join(siteRoot, `gatsby-config.mjs`),
}

const localPluginFixtureDir = path.join(fixtureRoot, `plugins`)
const localPluginTargetDir = path.join(siteRoot, `plugins`)

const gatsbyBin = path.join(`node_modules`, `gatsby`, `cli.js`)

async function build() {
  const { stdout } = await execa(process.execPath, [gatsbyBin, `build`], {
    env: {
      ...process.env,
      NODE_ENV: `production`,
    },
  })

  return stdout
}

// Tests include multiple assertions since running multiple builds is time consuming

describe(`gatsby-config.js`, () => {
  afterEach(async () => {
    await fs.rm(configPath.cjs)
    await fs.rm(localPluginTargetDir, { recursive: true })
  })

  it(`works with required CJS modules`, async () => {
    await fs.copyFile(fixturePath.cjs, configPath.cjs)

    await fs.ensureDir(localPluginTargetDir)
    await fs.copy(localPluginFixtureDir, localPluginTargetDir)

    const stdout = await build()

    // Build succeeded
    expect(stdout).toContain(`Done building`)

    // Requires work
    expect(stdout).toContain(`hello-default-cjs`)
    expect(stdout).toContain(`hello-named-cjs`)

    // Local gatsby-remark-plugin works
    expect(stdout).toContain(`gatsby-remark-cjs-gatsby-config-js`)
  })
})

describe(`gatsby-config.mjs`, () => {
  afterEach(async () => {
    await fs.rm(configPath.esm)
    await fs.rm(localPluginTargetDir, { recursive: true })
  })

  it(`works with imported ESM modules`, async () => {
    await fs.copyFile(fixturePath.esm, configPath.esm)

    await fs.ensureDir(localPluginTargetDir)
    await fs.copy(localPluginFixtureDir, localPluginTargetDir)

    const stdout = await build()

    // Build succeeded
    expect(stdout).toContain(`Done building`)

    // Imports work
    expect(stdout).toContain(`hello-default-esm`)
    expect(stdout).toContain(`hello-named-esm`)

    // Local plugin gatsby-config.mjs works
    expect(stdout).toContain(`a-local-plugin-gatsby-config-mjs`)

    // Local ESM gatsby-remark-plugin works
    expect(stdout).toContain(`gatsby-remark-esm-gatsby-config-mjs`)

    // Local plugin with an esm module passed via options works, this implicitly tests gatsby-node.mjs too
    expect(stdout).toContain(`a-local-plugin-using-passed-esm-module`)
  })
})
