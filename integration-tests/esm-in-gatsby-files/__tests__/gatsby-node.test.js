const path = require(`path`)
const fs = require(`fs-extra`)
const execa = require(`execa`)
const { spawn } = require(`child_process`)
const fetch = require(`node-fetch`)

jest.setTimeout(100000)

const fixtureRoot = path.resolve(__dirname, `fixtures`)
const siteRoot = path.resolve(__dirname, `..`)

const fixturePath = {
  gatsbyNodeCjs: path.join(fixtureRoot, `gatsby-node.js`),
  gatsbyNodeEsm: path.join(fixtureRoot, `gatsby-node.mjs`),
  gatsbyNodeEsmBundled: path.join(
    fixtureRoot,
    `gatsby-node-engine-bundled.mjs`
  ),
  ssrPage: path.join(fixtureRoot, `pages`, `ssr.js`),
}

const targetPath = {
  gatsbyNodeCjs: path.join(siteRoot, `gatsby-node.js`),
  gatsbyNodeEsm: path.join(siteRoot, `gatsby-node.mjs`),
  ssrPage: path.join(siteRoot, `src`, `pages`, `ssr.js`),
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

async function serve() {
  const serveProcess = spawn(process.execPath, [gatsbyBin, `serve`], {
    env: {
      ...process.env,
      NODE_ENV: `production`,
    },
  })

  await waitForServeReady(serveProcess)

  return serveProcess
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function waitForServeReady(serveProcess, retries = 0) {
  if (retries > 10) {
    console.error(
      `Server for esm-in-gatsby-files > gatsby-node.test.js failed to get ready after 10 tries`
    )
    serveProcess.kill()
  }

  await wait(500)

  let ready = false

  try {
    const { ok } = await fetch(`http://localhost:9000/`)
    ready = ok
  } catch (_) {
    // Do nothing
  }

  if (!ready) {
    retries++
    return waitForServeReady(serveProcess, retries)
  }
}

// Tests include multiple assertions since running multiple builds is time consuming

describe(`gatsby-node.js`, () => {
  afterEach(() => {
    fs.rmSync(targetPath.gatsbyNodeCjs)
  })

  it(`works with required CJS modules`, async () => {
    await fs.copyFile(fixturePath.gatsbyNodeCjs, targetPath.gatsbyNodeCjs)

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
    await fs.rm(targetPath.gatsbyNodeEsm)
    if (fs.existsSync(targetPath.ssrPage)) {
      await fs.rm(targetPath.ssrPage)
    }
  })

  it(`works with imported ESM modules`, async () => {
    await fs.copyFile(fixturePath.gatsbyNodeEsm, targetPath.gatsbyNodeEsm)

    const stdout = await build()

    // Build succeeded
    expect(stdout).toContain(`Done building`)

    // Imports work
    expect(stdout).toContain(`hello-default-esm`)
    expect(stdout).toContain(`hello-named-esm`)

    // Node API works
    expect(stdout).toContain(`gatsby-node-esm-on-pre-build`)
  })

  it(`works when bundled in engines`, async () => {
    await fs.copyFile(
      fixturePath.gatsbyNodeEsmBundled,
      targetPath.gatsbyNodeEsm
    )
    // Need to copy this because other runs fail on unfound query node type if the page is left in src
    await fs.copyFile(fixturePath.ssrPage, targetPath.ssrPage)

    const buildStdout = await build()
    const serveProcess = await serve()
    const response = await fetch(`http://localhost:9000/ssr/`)
    const html = await response.text()
    serveProcess.kill()

    // Build succeeded
    expect(buildStdout).toContain(`Done building`)

    // Engine bundling works
    expect(html).toContain(`gatsby-node-engine-bundled-mjs`)
  })
})
