/**
 * We want to make sure that fetch-remote-file is working with multi workers.
 */

const execa = require(`execa`)
const path = require(`path`)
const md5File = require(`md5-file`)
const { clean } = require("../../utils/create-devserver")
const basePath = path.resolve(__dirname, `../../`)

describe(`fetch-remote-file`, () => {
  beforeAll(async () => {
    await clean()
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
          "public/images/ce61bf418df0d6677d2701c4aeff1023/photoA.jpg"
        )
      )
    ).toEqual("37287aaa726d254eabcf3e7ede51a93b")
    expect(
      await md5File(
        path.join(
          __dirname,
          "../..",
          "public/images/adeb4bc975f3ce4081c6772a0c96ca7b/photoB.jpg"
        )
      )
    ).toEqual("cef966aac5cfc7972e91e5c5c96829cb")
    expect(
      await md5File(
        path.join(
          __dirname,
          "../..",
          "public/images/48315d9e12fde935993d8b406f2d6684/photoC.jpg"
        )
      )
    ).toEqual("c3d2efe723cd58311db404fd1b1f76a7")
  })
})
