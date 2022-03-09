import { copyFile, readFile, rm } from "fs/promises"
import { resolve } from "path"
import { addPlugins } from "../../handlers/plugin-add"

/**
 * Copy files from minimal starters instead of testing against static gatsby-configs
 * in fixtues so that these break if we change the starter configs in the future.
 */

const fixtures = resolve(`packages/gatsby-cli/src/__tests__/fixtures`)
const config = {
  starter: resolve(`starters/gatsby-starter-minimal/gatsby-config`),
  fixture: `${fixtures}/gatsby-config`,
}
const plugin = {
  hello: `gatsby-plugin-hello`,
  world: `gatsby-plugin-world`,
}

describe(`installPlugins write to gatsby-config.js`, () => {
  beforeEach(async () => {
    await copyFile(
      resolve(`${config.starter}.js`),
      resolve(`${config.fixture}.js`)
    )
  })

  afterEach(async () => {
    await rm(resolve(`${config.fixture}.js`))
  })

  it(`should not write with no plugins`, async () => {
    await addPlugins([], {}, fixtures, [])
    const gatsbyConfig = (await readFile(`${config.fixture}.js`)).toString()
    expect(gatsbyConfig).toMatchSnapshot()
  })

  it(`should write a single plugin`, async () => {
    await addPlugins([plugin.hello], {}, fixtures, [])
    const gatsbyConfig = (await readFile(`${config.fixture}.js`)).toString()
    expect(gatsbyConfig).toMatchSnapshot()
  })

  it(`should write multiple plugins`, async () => {
    await addPlugins([plugin.hello, plugin.world], {}, fixtures, [])
    const gatsbyConfig = (await readFile(`${config.fixture}.js`)).toString()
    expect(gatsbyConfig).toMatchSnapshot()
  })

  it(`should write a plugin with options`, async () => {
    await addPlugins(
      [plugin.hello],
      {
        [plugin.hello]: {
          greet: true,
        },
      },
      fixtures,
      []
    )
    const gatsbyConfig = (await readFile(`${config.fixture}.js`)).toString()
    expect(gatsbyConfig).toMatchSnapshot()
  })
})
