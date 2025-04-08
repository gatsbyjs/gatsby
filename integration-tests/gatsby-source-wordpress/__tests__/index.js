/**
 * @jest-environment node
 */

require(`dotenv`).config({
  path: `.env.test`,
})

const urling = require(`../test-fns/test-utils/urling`)

const {
  spawnGatsbyProcess,
  gatsbyCleanBeforeAll,
} = require(`../test-fns/test-utils/get-gatsby-process`)

const {
  mutateSchema,
  resetSchema,
} = require(`../test-fns/test-utils/increment-remote-data`)

const { fetchGraphql } = require("../test-fns/test-utils/graphql")

jest.setTimeout(100000)

const arePluginsReady = async () => {
  let pluginsAreReady = false
  let tryCount = 0
  const maxTryCount = 100
  let lastError = null

  while (!pluginsAreReady && tryCount < maxTryCount) {
    try {
      tryCount++

      const response = await fetchGraphql({
        url: `http://localhost:8001/graphql`,
        query: /* GraphQL */ `
          {
            __type(name: "AttachFeaturedImageToNodeByIdPayload") {
              name
            }
          }
        `,
      })

      if (
        response?.data?.__type?.name === `AttachFeaturedImageToNodeByIdPayload`
      ) {
        pluginsAreReady = true
      }
    } catch (e) {
      lastError = e
      await new Promise(resolve => setTimeout(resolve, 2500))
    }
  }

  return { pluginsAreReady, lastError }
}

// we run these tests twice in a row
// to make sure everything passes on a warm cache build
// we don't need to re-run some tests the second time,
// so the following allows us to do that:
const isWarmCache = process.env.WARM_CACHE

const testOnColdCacheOnly = isWarmCache ? test.skip : test

describe(`[gatsby-source-wordpress] Build default options`, () => {
  beforeAll(async () => {
    console.log(`Waiting for WP-CLI script to be finished ...`)
    await urling({ url: `http://localhost:8001/is-ready.txt`, retry: 100 })
    console.log(`WP-CLI script finished`)
    console.log(`Waiting for WPGraphQL to be ready...`)
    await urling({ url: `http://localhost:8001/graphql`, retry: 100 })
    console.log(`WPGraphQL is ready`)
    console.log(`Waiting for plugins to be ready...`)
    const { pluginsAreReady, lastError } = await arePluginsReady()
    if (!pluginsAreReady) {
      if (lastError) {
        console.error(`Plugins are not ready`)
        console.error(lastError)
      } else {
        console.error(
          `Plugins are not ready, but no error was thrown, check pluginsAreReady() setup`
        )
      }
      process.exit(1)
    }
    console.log(`Plugins are ready`)

    if (!isWarmCache) {
      await gatsbyCleanBeforeAll()
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
    if (process.env.SKIP_BEFORE_ALL) {
      return
    }

    if (!isWarmCache) {
      await gatsbyCleanBeforeAll()
    }

    if (
      isWarmCache &&
      (!process.env.HTACCESS_USERNAME || !process.env.HTACCESS_PASSWORD)
    ) {
      console.log(
        `Please add the env var HTACCESS_USERNAME and HTACCESS_PASSWORD. It should be a string in the following pattern: base64Encode(\`\${username}:\${password}\`)`
      )

      await new Promise(resolve => setTimeout(resolve, 100))
      process.exit(1)
    }

    try {
      if (isWarmCache) {
        const response = await mutateSchema()
        console.log(response)
      } else {
        const response = await resetSchema()
        console.log(response)
      }
    } catch (e) {
      console.info(`Threw errors while mutating or unmutating WordPress`)
      console.error(e.stack)
      await new Promise(resolve => setTimeout(resolve, 1000))
      process.exit(1)
    }

    return new Promise(resolve => {
      gatsbyDevelopProcess = spawnGatsbyProcess(`develop`)
      urling({ url: `http://localhost:8000/`, retry: 100 }).then(resolve)
    })
  })

  require(`../test-fns/index`)

  afterAll(done => {
    if (gatsbyDevelopProcess) {
      gatsbyDevelopProcess.kill()
    }

    done()
  })
})
