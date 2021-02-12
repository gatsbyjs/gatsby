require(`dotenv`).config({
  path: `.env.test`,
})

const { exec } = require(`child_process`)

const on = require(`wait-on`)
const {
  getGatsbyProcess,
  gatsbyCleanBeforeAll,
} = require(`../test-fns/test-utils/get-gatsby-process`)

const {
  resetSchema,
  mutateSchema,
} = require(`../test-fns/test-utils/increment-remote-data`)

const getDockerParentIp = async () =>
  new Promise((resolve, reject) => {
    exec(
      `docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' gatsby-source-wordpress_wordpress_1`,
      (error, stdout, stderr) => {
        if (error || stderr) {
          reject(`exec error: ${error || stderr}`)
        } else {
          resolve(stdout.replace(`\n`, ``))
        }
      }
    )
  })

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
    console.log(`here!!!!`)
    const dockerIp = await getDockerParentIp()
    const wpUrl = `http://${dockerIp}:8001`
    console.log({ wpUrl })
    console.log({ wpUrl })
    console.log({ wpUrl })
    console.log({ wpUrl })
    console.log({ wpUrl })
    await on({ resources: [wpUrl] })

    const wpGraphQLURL = `${wpUrl}/graphql`

    process.env.WPGRAPHQL_URL = wpGraphQLURL

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
    if (!process.env.WPGQL_INCREMENT) {
      console.log(`Cold develop build`)
      await resetSchema()

      await gatsbyCleanBeforeAll()
    } else {
      console.log(`Warm develop build`)
      await mutateSchema()
    }

    const dockerIp = await getDockerParentIp()
    const wpUrl = `http://${dockerIp}:8001`
    const wpGraphQLURL = `${wpUrl}/graphql`
    console.log({ wpUrl })
    console.log({ wpUrl })
    console.log({ wpUrl })
    console.log({ wpUrl })
    console.log({ wpUrl })

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
