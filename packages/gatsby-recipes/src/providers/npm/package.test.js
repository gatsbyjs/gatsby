const os = require(`os`)
const path = require(`path`)
const uuid = require(`uuid`)
const fs = require(`fs-extra`)

const pkg = require(`./package`)
const resourceTestHelper = require(`../resource-test-helper`)

const root = path.join(os.tmpdir(), uuid.v4())
fs.mkdirSync(root)
const pkgResource = { name: `glob` }

test(`plan returns a description`, async () => {
  const result = await pkg.plan({ root }, pkgResource)

  expect(result.describe).toEqual(expect.stringContaining(`Install glob`))
})

describe.skip(`npm package resource`, () => {
  test(`e2e npm package resource test`, async () => {
    await resourceTestHelper({
      resourceModule: pkg,
      resourceName: `NPMPackage`,
      context: { root },
      initialObject: { name: `is-sorted`, version: `1.0.0` },
      partialUpdate: { name: `is-sorted`, version: `1.0.2` },
    })
  })
})

describe(`package manager client commands`, () => {
  it(`generates the correct commands for yarn`, () => {
    const yarnInstall = pkg.generateClientComands({
      packageManager: `yarn`,
      depType: ``,
      packageNames: [`gatsby`],
    })

    const yarnDevInstall = pkg.generateClientComands({
      packageManager: `yarn`,
      depType: `development`,
      packageNames: [`eslint`],
    })

    expect(yarnInstall).toMatchSnapshot()
    expect(yarnDevInstall).toMatchSnapshot()
  })
  it(`generates the correct commands for npm`, () => {
    const yarnInstall = pkg.generateClientComands({
      packageManager: `npm`,
      depType: ``,
      packageNames: [`gatsby`],
    })

    const yarnDevInstall = pkg.generateClientComands({
      packageManager: `npm`,
      depType: `development`,
      packageNames: [`eslint`],
    })

    expect(yarnInstall).toMatchSnapshot()
    expect(yarnDevInstall).toMatchSnapshot()
  })
})
