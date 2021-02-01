const execa = require(`execa`)
const path = require(`path`)
const fs = require(`fs-extra`)
const glob = require(`glob`)
const fetch = require(`node-fetch`)
const createDevServer = require(`../../utils/create-devserver`)
const basePath = path.resolve(__dirname, `../../`)
const detectPort = require(`detect-port`)

// 2 min
jest.setTimeout(2000 * 60)

const cleanDirs = () =>
  Promise.all([
    fs.emptyDir(`${basePath}/public`),
    fs.emptyDir(`${basePath}/.cache`),
  ])

describe(`Lazy images`, () => {
  beforeAll(async () => {
    await cleanDirs()
  })

  test(`should process images on demand`, async () => {
    const port = await detectPort(9023)
    const { kill } = await createDevServer(port)

    const response = await fetch(
      `http://localhost:${port}/static/6d91c86c0fde632ba4cd01062fd9ccfa/2a4de/gatsby-astronaut.png`
    )

    await kill()

    expect(response.status).toBe(200)

    const images = glob.sync(`${basePath}/public/**/*.png`)
    expect(images.length).toBe(6)
  })

  test(`should process the rest of images on build`, async () => {
    await execa(`yarn`, [`build`], {
      cwd: basePath,
      env: { NODE_ENV: `production` },
    })

    const images = glob.sync(`${basePath}/public/**/*.png`)
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
})
