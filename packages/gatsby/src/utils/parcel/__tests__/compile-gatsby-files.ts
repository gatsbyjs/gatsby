import { Parcel } from "@parcel/core"
import {
  constructBundler,
  compileGatsbyFiles,
  COMPILED_CACHE_DIR,
} from "../compile-gatsby-files"
import { siteMetadata } from "./fixtures/utils/site-metadata"
import { moreDataConfig } from "./fixtures/utils/more-data-config"
import { readFile, remove } from "fs-extra"

const dir = {
  js: `${__dirname}/fixtures/js`,
  ts: `${__dirname}/fixtures/ts`,
}

const config = {
  js: [{ entry: dir.js, dist: `${dir.js}/${COMPILED_CACHE_DIR}` }],
  ts: [{ entry: dir.ts, dist: `${dir.ts}/${COMPILED_CACHE_DIR}` }],
}

jest.mock(`@parcel/core`, () => {
  const parcelCore = jest.requireActual(`@parcel/core`)

  const { Parcel: OriginalParcel } = parcelCore

  class MockedParcel extends OriginalParcel {
    constructor(options) {
      super(options)
      this.options = options // Expose for assertions
    }
  }

  return {
    ...parcelCore,
    Parcel: MockedParcel,
  }
})

interface IMockedParcel extends Parcel {
  options: unknown
}

describe(`gatsby file compilation`, () => {
  describe(`constructBundler`, () => {
    it(`should construct Parcel relative to passed directory`, () => {
      const { options } = constructBundler(config.js) as IMockedParcel

      expect(options).toMatchSnapshot({
        entries: `${dir.js}/gatsby-+(node|config).{ts,tsx,js}`,
        targets: {
          default: {
            distDir: `${dir.js}/${COMPILED_CACHE_DIR}`,
          },
        },
        cacheDir: `${dir.js}/.cache/.parcel-cache`,
      })
    })
  })

  describe(`compileGatsbyFiles`, () => {
    afterEach(async () => {
      for (const directory of [dir.js, dir.ts]) {
        await remove(`${directory}/.cache`)
      }
    })

    it(`should compile gatsby-config.js`, async () => {
      await compileGatsbyFiles(config.js)

      const compiledGatsbyConfig = await readFile(
        `${dir.js}/.cache/compiled/gatsby-config.js`,
        `utf-8`
      )

      expect(compiledGatsbyConfig).toContain(siteMetadata.title)
      expect(compiledGatsbyConfig).toContain(siteMetadata.siteUrl)
      expect(compiledGatsbyConfig).toContain(moreDataConfig.options.name)
    })

    it(`should compile gatsby-config.ts`, async () => {
      await compileGatsbyFiles(config.ts)

      const compiledGatsbyConfig = await readFile(
        `${dir.ts}/.cache/compiled/gatsby-config.js`,
        `utf-8`
      )

      expect(compiledGatsbyConfig).toContain(siteMetadata.title)
      expect(compiledGatsbyConfig).toContain(siteMetadata.siteUrl)
      expect(compiledGatsbyConfig).toContain(moreDataConfig.options.name)
    })

    it(`should compile gatsby-node.js`, async () => {
      await compileGatsbyFiles(config.js)

      const compiledGatsbyNode = await readFile(
        `${dir.js}/.cache/compiled/gatsby-node.js`,
        `utf-8`
      )

      expect(compiledGatsbyNode).toContain(`I am working!`)
    })

    it(`should compile gatsby-node.ts`, async () => {
      await compileGatsbyFiles(config.ts)

      const compiledGatsbyNode = await readFile(
        `${dir.ts}/.cache/compiled/gatsby-node.js`,
        `utf-8`
      )

      expect(compiledGatsbyNode).toContain(`I am working!`)
    })
  })
})
