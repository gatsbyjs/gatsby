/**
 * @jest-environment node
 */

require(`dotenv`).config({
  path: `.env.test`,
})

const urling = require(`urling`)

const {
  spawnGatsbyProcess,
  gatsbyCleanBeforeAll,
} = require(`../test-fns/test-utils/get-gatsby-process`)

const {
  mutateSchema,
  resetSchema,
} = require(`../test-fns/test-utils/increment-remote-data`)

jest.setTimeout(100000)

// we run these tests twice in a row
// to make sure everything passes on a warm cache build
// we don't need to re-run some tests the second time,
// so the following allows us to do that:
const isWarmCache = process.env.WARM_CACHE

const testOnColdCacheOnly = isWarmCache ? test.skip : test

describe(`[gatsby-source-wordpress] Build default options`, () => {
  beforeAll(async done => {
    await urling({ url: `http://localhost:8001/graphql`, retry: 15 })

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

  beforeAll(async () => {
    if (!isWarmCache) {
      await gatsbyCleanBeforeAll()
    }

    if (isWarmCache && !process.env.WORDPRESS_BASIC_AUTH) {
      console.log(
        `Please add the env var WORDPRESS_BASIC_AUTH. It should be a string in the following pattern: base64Encode(\`\${username}:\${password}\`)`
      )

      await new Promise(resolve => setTimeout(resolve, 100))
      process.exit(1)
    }

    if (isWarmCache) {
      const response = await mutateSchema()
      console.log(response)
    } else {
      const response = await resetSchema()
      console.log(response)
    }

    gatsbyDevelopProcess = spawnGatsbyProcess(`develop`)

    await urling(`http://localhost:8000`)
  })

  require(`../test-fns/index`)

  afterAll(done => {
    gatsbyDevelopProcess.kill()
    done()
  })
})
