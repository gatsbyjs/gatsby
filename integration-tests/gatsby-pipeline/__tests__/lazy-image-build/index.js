const execa = require(`execa`)
const path = require(`path`)
const fs = require(`fs-extra`)
const glob = require(`glob`)
const request = require(`request-promise-native`)
const createDevServer = require(`../../utils/create-devserver`)
const basePath = path.resolve(__dirname, `../../`)

// 2 min
jest.setTimeout(2000 * 60)

const cleanDirs = () =>
  Promise.all([
    fs.emptyDir(`${basePath}/public`),
    fs.emptyDir(`${basePath}/.cache`),
  ])

const configFiles = {
  gatsby: path.join(__dirname, `../../gatsby-config.js`),
  default: path.join(__dirname, `../../gatsby-config-default.js`),
  nolazy: path.join(__dirname, `../../gatsby-config-nolazy.js`),
}

describe(`Lazy images`, () => {
  beforeAll(async () => {
    await cleanDirs()
  })

  beforeEach(async () => {
    await fs.copy(configFiles.default, configFiles.gatsby)
  })

  test(`should process images on demand`, async () => {
    const { kill } = await createDevServer()

    const response = await request(
      `http://localhost:8000/static/6d91c86c0fde632ba4cd01062fd9ccfa/cc8d4/gatsby-astronaut.png`,
      {
        resolveWithFullResponse: true,
      }
    )

    await kill()

    expect(response.statusCode).toBe(200)
    expect(response.headers[`content-type`]).toBe(`image/png`)

    const images = glob.sync(`${basePath}/public/**/*.png`)
    expect(images.length).toBe(1)
  })

  test(`should process the rest of images on build`, async () => {
    let images = glob.sync(`${basePath}/public/**/*.png`)
    expect(images.length).toBe(1)

    await execa(`yarn`, [`build`], {
      cwd: basePath,
      env: { NODE_ENV: `production` },
    })

    images = glob.sync(`${basePath}/public/**/*.png`)
    expect(images.length).toBe(6)
  })

  test(`should process all images from a clean build`, async () => {
    await cleanDirs()
    await execa(`yarn`, [`build`], {
      cwd: basePath,
      env: { NODE_ENV: `production` },
    })

    const images = glob.sync(`${basePath}/public/**/*.png`)
    expect(images.length).toBe(6)
  })

  test(`should process all images on develop when lazyImageGeneration is false`, async () => {
    await fs.copy(configFiles.nolazy, configFiles.gatsby)

    await cleanDirs()
    const { kill } = await createDevServer()

    await kill()

    const images = glob.sync(`${basePath}/public/**/*.png`)
    expect(images.length).toBe(6)
  })
})
