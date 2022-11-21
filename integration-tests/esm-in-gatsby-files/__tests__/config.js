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

describe(`gatsby-config.js`, () => {
  afterEach(() => {
    fs.rmSync(configPath.cjs)
  })

  it(`works with required CJS modules`, async () => {
    await fs.copyFile(fixturePath.cjs, configPath.cjs)
    const stdout = await build()
    expect(stdout).toContain(`Done building`)
    expect(stdout).toContain(`hello-default-cjs`)
    expect(stdout).toContain(`hello-named-cjs`)
  })
})

describe(`gatsby-config.mjs`, () => {
  afterEach(() => {
    fs.rmSync(configPath.esm)
  })

  it(`works with required ESM modules`, async () => {
    await fs.copyFile(fixturePath.esm, configPath.esm)
    const stdout = await build()
    expect(stdout).toContain(`Done building`)
    expect(stdout).toContain(`hello-default-esm`)
    expect(stdout).toContain(`hello-named-esm`)
  })
})
