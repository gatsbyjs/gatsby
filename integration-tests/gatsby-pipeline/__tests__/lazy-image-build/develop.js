const execa = require(`execa`)
const path = require(`path`)
const fs = require(`fs-extra`)
const glob = require(`glob`)
const request = require(`request-promise-native`)
const createDevServer = require(`../../utils/createDevServer`)
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

    const response = await request(
      `http://localhost:8000/static/6d91c86c0fde632ba4cd01062fd9ccfa/a2541/gatsby-astronaut.png`,
      {
        resolveWithFullResponse: true,
      }
    )

    await kill()

    expect(response.statusCode).toBe(200)

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

    await expect(
      fs.pathExists(
        `${basePath}/public/static/6d91c86c0fde632ba4cd01062fd9ccfa/5c9de/gatsby-astronaut.png`
      )
    ).resolves.toBe(true)
    await expect(
      fs.pathExists(
        `${basePath}/public/static/6d91c86c0fde632ba4cd01062fd9ccfa/7e26c/gatsby-astronaut.png`
      )
    ).resolves.toBe(true)
    await expect(
      fs.pathExists(
        `${basePath}/public/static/6d91c86c0fde632ba4cd01062fd9ccfa/360b8/gatsby-astronaut.png`
      )
    ).resolves.toBe(true)
    await expect(
      fs.pathExists(
        `${basePath}/public/static/6d91c86c0fde632ba4cd01062fd9ccfa/893cf/gatsby-astronaut.png`
      )
    ).resolves.toBe(true)
    await expect(
      fs.pathExists(
        `${basePath}/public/static/6d91c86c0fde632ba4cd01062fd9ccfa/a2541/gatsby-astronaut.png`
      )
    ).resolves.toBe(true)
  })
})
