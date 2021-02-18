require(`dotenv`).config({
  path: `.env.test`,
})

const on = require(`wait-on`)
const {
  spawnGatsbyProcess,
  gatsbyCleanBeforeAll,
} = require(`../test-fns/test-utils/get-gatsby-process`)

jest.setTimeout(100000)

// we run these tests twice in a row
// to make sure everything passes on a warm cache build
// we don't need to re-run some tests the second time,
// so the following allows us to do that:
const isWarmCache = process.env.WARM_CACHE
const testOnColdCacheOnly = isWarmCache ? test.skip : test

describe(`[gatsby-source-wordpress] Build default options`, () => {
  beforeAll(done => {
    if (isWarmCache) {
      done()
    } else {
      gatsbyCleanBeforeAll(done)
    }
  })

  testOnColdCacheOnly(`Default options build succeeded`, async () => {
    const gatsbyProcess = spawnGatsbyProcess(`build`, {
      DEFAULT_PLUGIN_OPTIONS: `1`,
    })

    const exitCode = await new Promise(resolve =>
      gatsbyProcess.on(`exit`, resolve)
    )

    expect(exitCode).toEqual(0)

    gatsbyProcess.kill()
  })
})

describe(`[gatsby-source-wordpress] Run tests on develop build`, () => {
  let gatsbyDevelopProcess

  beforeAll(async done => {
    if (!isWarmCache) {
      await gatsbyCleanBeforeAll()
    }

    gatsbyDevelopProcess = spawnGatsbyProcess(`develop`)

    await on({ resources: [`http://localhost:8000`] })
    done()
  })

  require(`../test-fns/index`)

  afterAll(done => {
    gatsbyDevelopProcess.kill()
    done()
  })
})
