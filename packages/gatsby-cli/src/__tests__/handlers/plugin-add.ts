import { ensureDir, copyFile, readFile, rm } from "fs-extra"
import { join } from "path"
import { addPlugins } from "../../handlers/plugin-add"

/**
 * Copy files from minimal starters instead of testing against static gatsby-configs
 * in fixtues so that these break if we change the starter configs in a breaking way.
 *
 * Not using `jest.each` since I find that much harder to read and debug.
 * @see {@link https://jestjs.io/docs/api#testeachtablename-fn-timeout}
 */

const root = join(__dirname, `../../../../..`)
const fixtures = join(__dirname, `../fixtures`)
const config = {
  js: {
    starter: `${root}/starters/gatsby-starter-minimal/gatsby-config.js`,
    fixture: `${fixtures}/gatsby-config.js`,
  },
  ts: {
    starter: `${root}/starters/gatsby-starter-minimal-ts/gatsby-config.ts`,
    fixture: `${fixtures}/gatsby-config.ts`,
  },
}
const plugin = {
  hello: `gatsby-plugin-hello`,
  world: `gatsby-plugin-world`,
}

describe(`addPlugins`, () => {
  beforeAll(async () => {
    await ensureDir(fixtures)
  })

  describe(`gatsby-config.js`, () => {
    beforeEach(async () => {
      await copyFile(config.js.starter, config.js.fixture)
    })

    afterEach(async () => {
      await rm(config.js.fixture)
    })

    it(`should not write with no plugins`, async () => {
      await addPlugins([], {}, fixtures, [])
      const gatsbyConfig = (await readFile(config.js.fixture)).toString()
      expect(gatsbyConfig).toMatchSnapshot()
    })

    it(`should write a single plugin`, async () => {
      await addPlugins([plugin.hello], {}, fixtures, [])
      const gatsbyConfig = (await readFile(config.js.fixture)).toString()
      expect(gatsbyConfig).toMatchSnapshot()
    })

    it(`should write multiple plugins`, async () => {
      await addPlugins([plugin.hello, plugin.world], {}, fixtures, [])
      const gatsbyConfig = (await readFile(config.js.fixture)).toString()
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
      const gatsbyConfig = (await readFile(config.js.fixture)).toString()
      expect(gatsbyConfig).toMatchSnapshot()
    })
  })

  describe(`gatsby-config.ts`, () => {
    beforeEach(async () => {
      await copyFile(config.ts.starter, config.ts.fixture)
    })

    afterEach(async () => {
      await rm(config.ts.fixture)
    })

    it(`should not write with no plugins`, async () => {
      await addPlugins([], {}, fixtures, [])
      const gatsbyConfig = (await readFile(config.ts.fixture)).toString()
      expect(gatsbyConfig).toMatchSnapshot()
    })

    it(`should write a single plugin`, async () => {
      await addPlugins([plugin.hello], {}, fixtures, [])
      const gatsbyConfig = (await readFile(config.ts.fixture)).toString()
      expect(gatsbyConfig).toMatchSnapshot()
    })

    it(`should write multiple plugins`, async () => {
      await addPlugins([plugin.hello, plugin.world], {}, fixtures, [])
      const gatsbyConfig = (await readFile(config.ts.fixture)).toString()
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
      const gatsbyConfig = (await readFile(config.ts.fixture)).toString()
      expect(gatsbyConfig).toMatchSnapshot()
    })
  })
})
