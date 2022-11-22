import path from "path"
import fs from "fs-extra"
import execa from "execa"

jest.setTimeout(100000)

const fixtureRoot = path.resolve(__dirname, `fixtures`)
const siteRoot = path.resolve(__dirname, `..`)

const fixturePath = {
  cjs: path.join(fixtureRoot, `gatsby-node.js`),
  esm: path.join(fixtureRoot, `gatsby-node.mjs`),
}

const gatsbyNodePath = {
  cjs: path.join(siteRoot, `gatsby-node.js`),
  esm: path.join(siteRoot, `gatsby-node.mjs`),
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

// Tests include multiple assertions since running multiple builds is time consuming

describe(`gatsby-node.js`, () => {
  afterEach(() => {
    fs.rmSync(gatsbyNodePath.cjs)
  })

  it(`works with required CJS modules`, async () => {
    await fs.copyFile(fixturePath.cjs, gatsbyNodePath.cjs)

    const stdout = await build()

    // Build succeeded
    expect(stdout).toContain(`Done building`)

    // Requires work
    expect(stdout).toContain(`hello-default-cjs`)
    expect(stdout).toContain(`hello-named-cjs`)

    // Node API works
    expect(stdout).toContain(`gatsby-node-cjs-on-pre-build`)
  })
})

describe(`gatsby-node.mjs`, () => {
  afterEach(async () => {
    await fs.rm(gatsbyNodePath.esm)
  })

  it(`works with imported ESM modules`, async () => {
    await fs.copyFile(fixturePath.esm, gatsbyNodePath.esm)

    const stdout = await build()

    // Build succeeded
    expect(stdout).toContain(`Done building`)

    // Imports work
    expect(stdout).toContain(`hello-default-esm`)
    expect(stdout).toContain(`hello-named-esm`)

    // Node API works
    expect(stdout).toContain(`gatsby-node-esm-on-pre-build`)
  })
})
