require(`dotenv`).config({
  path: `.env.test`,
})

const on = require(`wait-on`)
const {
  getGatsbyProcess,
  gatsbyCleanBeforeAll,
} = require(`../test-fns/test-utils/get-gatsby-process`)

jest.setTimeout(100000)

const wpGraphQLURL = `http://localhost:8001/graphql`

describe(`[gatsby-source-wordpress] Build default options`, () => {
  beforeAll(done => {
    console.log(`Build default options`)

    gatsbyCleanBeforeAll(done)
  })

  test(`Default options build succeeded`, async () => {
    const gatsbyProcess = getGatsbyProcess(`build`, {
      DEFAULT_PLUGIN_OPTIONS: `1`,
      WPGRAPHQL_URL: wpGraphQLURL,
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
    gatsbyDevelopProcess = getGatsbyProcess(`develop`, {
      WPGRAPHQL_URL: wpGraphQLURL,
    })

    await on({ resources: [`http://localhost:8000`] })
    done()
  })

  require(`../test-fns/index`)

  afterAll(done => {
    gatsbyDevelopProcess.kill()
    done()
  })
})
