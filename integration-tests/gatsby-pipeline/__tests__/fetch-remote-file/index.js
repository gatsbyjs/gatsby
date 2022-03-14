/**
 * We want to make sure that fetch-remote-file is working with multi workers.
 */

const execa = require(`execa`)
const path = require(`path`)
const glob = require(`glob`)
const fs = require(`fs-extra`)
const md5File = require(`md5-file`)
const basePath = path.resolve(__dirname, `../../`)

const cleanDirs = () =>
  Promise.all([
    fs.emptyDir(`${basePath}/public`),
    fs.emptyDir(`${basePath}/.cache`),
  ])

describe(`fetch-remote-file`, () => {
  beforeAll(async () => {
    await cleanDirs()
    await execa(`yarn`, [`build`], {
      cwd: basePath,
      // we want to force 1 query per worker
      env: { NODE_ENV: `production`, GATSBY_PARALLEL_QUERY_CHUNK_SIZE: `1` },
    })
  }, 60 * 1000)

  it("should have the correct md5", async () => {
    expect(
      await md5File(
        path.join(
          __dirname,
          "../..",
          "public/images/50c58a791de3c2303e62084d731799eb/photoA.jpg"
        )
      )
    ).toEqual("a9e57a66a10b2d26a1999a4685d7c9ef")
    expect(
      await md5File(
        path.join(
          __dirname,
          "../..",
          "public/images/4910e745c3c453b8795d6ba65c79d99b/photoB.jpg"
        )
      )
    ).toEqual("c305dc5c5db45cc773231a507af5116d")
    expect(
      await md5File(
        path.join(
          __dirname,
          "../..",
          "public/images/fb673e75e9534b3cc2d2e24085386d48/photoC.jpg"
        )
      )
    ).toEqual("4ba953ba27236727d7abe7d5b8916432")
  })

  /**
   * this is a bit of a cheeky test but we just want to make sure we're actually running on multiple workers
   */
  it("should have conflict between workers", async () => {
    const files = await fs.readdir(path.join(__dirname, "../../.cache/workers"))

    expect(files.length).toBeGreaterThan(1)
  })
})
