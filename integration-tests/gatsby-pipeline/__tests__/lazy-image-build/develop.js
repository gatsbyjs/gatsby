const execa = require(`execa`)
const path = require(`path`)
const fs = require(`fs-extra`)
const glob = require(`glob`)
const fetch = require(`node-fetch`)
const md5File = require(`md5-file`)
const createDevServer = require(`../../utils/create-devserver`)
const basePath = path.resolve(__dirname, `../../`)

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
