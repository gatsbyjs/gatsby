const execa = require(`execa`)
const path = require(`path`)
const fs = require(`fs-extra`)
const basePath = path.resolve(__dirname, `../../`)
const request = require(`request-promise-native`)

// 1 min
jest.setTimeout(1000 * 60)

const bootDevelop = () =>
  new Promise(resolve => {
    const devProcess = execa(`yarn`, [`develop`], {
      cwd: basePath,
      env: { NODE_ENV: `development` },
      detached: true,
    })

    devProcess.stdout.on(`data`, chunk => {
      if (chunk.toString().includes(`You can now view`)) {
        // resolving the devProcess wans't seem to resolve the promise so it's wrapped in an object.
        resolve({ process: devProcess })
      }
    })
  })

const killDevelop = devProcess =>
  new Promise(resolve => {
    if (!devProcess) {
      return resolve()
    }

    devProcess.on(`exit`, code => {
      // give it some time to exit
      setTimeout(() => {
        resolve()
      }, 0)
    })

    return process.kill(-devProcess.pid)
  })

const cleanDirs = () =>
  Promise.all([
    fs.emptyDir(`${basePath}/public`),
    fs.emptyDir(`${basePath}/.cache`),
  ])

describe(`Lazy images`, () => {
  beforeAll(() => cleanDirs())

  test(`should process images on demand`, async () => {
    const { process: devProcess } = await bootDevelop()

    const response = await request(
      `http://localhost:8000/static/6d91c86c0fde632ba4cd01062fd9ccfa/a2541/gatsby-astronaut.png`,
      {
        resolveWithFullResponse: true,
      }
    )

    await killDevelop(devProcess)

    expect(response.statusCode).toBe(200)
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

  test(`should process the rest of images on build`, async () => {
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
