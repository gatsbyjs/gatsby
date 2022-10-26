const execa = require(`execa`)
const path = require(`path`)
const glob = require(`glob`)
const fetch = require(`node-fetch`)
const md5File = require(`md5-file`)
const { clean, createDevServer } = require(`../../utils/create-devserver`)
const { isCI } = require("gatsby-core-utils")
const basePath = path.resolve(__dirname, `../../`)

// 5 min
jest.setTimeout(5000 * 60)

describe(`Lazy images`, () => {
  beforeAll(async () => {
    await clean()
  })

  it(`should process images on demand`, async () => {
    const { kill } = await createDevServer()
    const contentDigest = await md5File(
      path.resolve("./src/images/gatsby-astronaut.png")
    )

    const response = await fetch(
      `http://localhost:8000/static/${contentDigest}/630fb/gatsby-astronaut.png`
    )

    await kill()

    expect(response.status).toBe(200)

    const images = glob.sync(`${basePath}/public/**/*.png`)
    // we disable lazy images on CI
    // https://github.com/gatsbyjs/gatsby/blob/b474dbb25518b51ca8cc1ce75fffb044e7d8609a/packages/gatsby-plugin-sharp/src/index.js#L150-L159
    expect(images.length).toBe(isCI() ? 6 : 1)
  })

  it(`should process the rest of images on build`, async () => {
    await execa(`yarn`, [`build`], {
      cwd: basePath,
      env: { NODE_ENV: `production` },
    })

    const images = glob.sync(`${basePath}/public/**/*.png`)
    expect(images.length).toBe(6)
  })

  it(`should process all images from a clean build`, async () => {
    await clean()
    await execa(`yarn`, [`build`], {
      cwd: basePath,
      env: { NODE_ENV: `production` },
    })

    const images = glob.sync(`${basePath}/public/**/*.png`)
    expect(images.length).toBe(6)
  })
})
