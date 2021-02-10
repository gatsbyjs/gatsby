require(`dotenv`).config({
  path: `.env.test`,
})

const on = require(`wait-on`)
const {
  getGatsbyProcess,
  gatsbyCleanBeforeAll,
} = require(`../test-fns/test-utils/get-gatsby-process`)

const {
  resetSchema,
  mutateSchema,
} = require(`../test-fns/test-utils/increment-remote-data`)

jest.setTimeout(100000)

describe(`[gatsby-source-wordpress] Build default options`, () => {
  beforeAll(done => {
    if (process.env.WPGQL_INCREMENT) {
      return
    }

    console.log(`Build default options`)

    gatsbyCleanBeforeAll(done)
  })

  // skip this test when we run with WPGQL_INCREMENT=true
  // because we only want to run the "Run tests on develop build" tests
  const testFn = process.env.WPGQL_INCREMENT ? test.skip : test

  testFn(`Default options build succeeded`, async () => {
    const gatsbyProcess = getGatsbyProcess(`build`, {
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
    if (!process.env.WPGQL_INCREMENT) {
      console.log(`Cold develop build`)
      await resetSchema()

      await gatsbyCleanBeforeAll()
    } else {
      console.log(`Warm develop build`)
      await mutateSchema()
    }
    gatsbyDevelopProcess = getGatsbyProcess(`develop`)

    await on({ resources: [`http://localhost:8000`] })
    done()
  })

  require(`../test-fns/index`)

  afterAll(done => {
    gatsbyDevelopProcess.kill()
    done()
  })
})
