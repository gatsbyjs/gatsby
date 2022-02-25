// @ts-check

import path from "path"
import zlib from "zlib"
import { rest } from "msw"
import { setupServer } from "msw/node"
import { Writable } from "stream"
import got from "got"
import fs from "fs-extra"
import { fetchRemoteFile } from "../fetch-remote-file"
import * as storage from "../utils/get-storage"

jest.spyOn(storage, `getDatabaseDir`)
jest.spyOn(got, `stream`)
jest.spyOn(fs, `move`)

const gotStream = got.stream
const fsMove = fs.move

const urlCount = new Map()

async function getFileSize(file) {
  const stat = await fs.stat(file)

  return stat.size
}

/**
 * A utility to help create file responses
 * - Url with attempts will use maxBytes for x amount of time until it delivers the full response
 * - MaxBytes indicates how much bytes we'll be sending
 *
 * @param {string} file File path on disk
 * @param {Object} req Is the request object from msw
 * @param {{ compress?: boolean}} options Options for the getFilecontent (use gzip or not)
 */
async function getFileContent(file, req, options = {}) {
  const cacheKey = req.url.origin + req.url.pathname
  const maxRetry = req.url.searchParams.get(`attempts`)
  const maxBytes = req.url.searchParams.get(`maxBytes`)
  const currentRetryCount = urlCount.get(cacheKey) || 0
  urlCount.set(cacheKey, currentRetryCount + 1)

  let fileContentBuffer = await fs.readFile(file)
  if (options.compress) {
    fileContentBuffer = zlib.deflateSync(fileContentBuffer)
  }

  const content = await new Promise(resolve => {
    const fileStream = fs.createReadStream(file, {
      end:
        currentRetryCount < Number(maxRetry)
          ? Number(maxBytes)
          : Number.MAX_SAFE_INTEGER,
    })

    const writableStream = new Writable()
    const result = []
    writableStream._write = (chunk, encoding, next) => {
      result.push(chunk)

      next()
    }

    writableStream.on(`finish`, () => {
      resolve(Buffer.concat(result))
    })

    // eslint-disable-next-line no-unused-vars
    let stream = fileStream
    if (options.compress) {
      stream = stream.pipe(zlib.createDeflate())
    }

    stream.pipe(writableStream)
  })

  return {
    content,
    contentLength:
      req.url.searchParams.get(`contentLength`) === `false`
        ? undefined
        : String(fileContentBuffer.length),
  }
}

let attempts503 = 0

const server = setupServer(
  rest.get(`http://external.com/logo.svg`, async (req, res, ctx) => {
    const { content, contentLength } = await getFileContent(
      path.join(__dirname, `./fixtures/gatsby-logo.svg`),
      req
    )

    return res(
      ctx.set(`Content-Type`, `image/svg+xml`),
      ctx.set(`Content-Length`, contentLength),
      ctx.status(200),
      ctx.body(content)
    )
  }),
  rest.get(`http://external.com/logo-gzip.svg`, async (req, res, ctx) => {
    const { content, contentLength } = await getFileContent(
      path.join(__dirname, `./fixtures/gatsby-logo.svg`),
      req,
      {
        compress: true,
      }
    )

    return res(
      ctx.set(`Content-Type`, `image/svg+xml`),
      ctx.set(`content-encoding`, `gzip`),
      ctx.set(`Content-Length`, contentLength),
      ctx.status(200),
      ctx.body(content)
    )
  }),
  rest.get(`http://external.com/dog.jpg`, async (req, res, ctx) => {
    const { content, contentLength } = await getFileContent(
      path.join(__dirname, `./fixtures/dog-thumbnail.jpg`),
      req
    )

    return res(
      ctx.set(`Content-Type`, `image/jpg`),
      ctx.set(`Content-Length`, contentLength),
      ctx.status(200),
      ctx.body(content)
    )
  }),
  rest.get(`http://external.com/dog`, async (req, res, ctx) => {
    const { content, contentLength } = await getFileContent(
      path.join(__dirname, `./fixtures/dog-thumbnail.jpg`),
      req
    )

    return res(
      ctx.set(`Content-Type`, `image/jpg`),
      ctx.set(`Content-Length`, contentLength),
      ctx.status(200),
      ctx.body(content)
    )
  }),
  rest.get(
    `http://external.com/invalid:dog*name.jpg`,
    async (req, res, ctx) => {
      const { content, contentLength } = await getFileContent(
        path.join(__dirname, `./fixtures/dog-thumbnail.jpg`),
        req
      )

      return res(
        ctx.set(`Content-Type`, `image/jpg`),
        ctx.set(`Content-Length`, contentLength),
        ctx.status(200),
        ctx.body(content)
      )
    }
  ),
  rest.get(`http://external.com/dog-304.jpg`, async (req, res, ctx) => {
    const { content, contentLength } = await getFileContent(
      path.join(__dirname, `./fixtures/dog-thumbnail.jpg`),
      req
    )

    return res(
      ctx.set(`Content-Type`, `image/jpg`),
      ctx.set(`Content-Length`, contentLength),
      ctx.set(`etag`, `abcd`),
      ctx.status(req.headers.get(`if-none-match`) === `abcd` ? 304 : 200),
      ctx.body(content)
    )
  }),
  rest.get(`http://external.com/404.jpg`, async (req, res, ctx) => {
    const content = `Page not found`

    return res(
      ctx.set(`Content-Type`, `text/html`),
      ctx.set(`Content-Length`, String(content.length)),
      ctx.status(404),
      ctx.body(content)
    )
  }),
  rest.get(`http://external.com/500.jpg`, async (req, res, ctx) => {
    const content = `Server error`

    return res(
      ctx.set(`Content-Type`, `text/html`),
      ctx.set(`Content-Length`, String(content.length)),
      ctx.status(500),
      ctx.body(content)
    )
  }),
  rest.get(`http://external.com/503-twice.svg`, async (req, res, ctx) => {
    const errorContent = `Server error`
    attempts503++

    if (attempts503 < 3) {
      return res(
        ctx.set(`Content-Type`, `text/html`),
        ctx.set(`Content-Length`, String(errorContent.length)),
        ctx.status(503),
        ctx.body(errorContent)
      )
    }

    const { content, contentLength } = await getFileContent(
      path.join(__dirname, `./fixtures/gatsby-logo.svg`),
      req
    )

    return res(
      ctx.set(`Content-Type`, `image/svg+xml`),
      ctx.set(`Content-Length`, contentLength),
      ctx.status(200),
      ctx.body(content)
    )
  }),
  rest.get(`http://external.com/503-forever.svg`, async (req, res, ctx) => {
    const errorContent = `Server error`
    return res(
      ctx.set(`Content-Type`, `text/html`),
      ctx.set(`Content-Length`, String(errorContent.length)),
      ctx.status(503),
      ctx.body(errorContent)
    )
  }),
  rest.get(`http://external.com/network-error.svg`, (req, res) =>
    res.networkError(`ECONNREFUSED`)
  )
)

async function createMockCache(tmpDir) {
  return {
    get: jest.fn(() => Promise.resolve(null)),
    set: jest.fn(() => Promise.resolve(null)),
    directory: tmpDir,
  }
}

describe(`fetch-remote-file`, () => {
  let cache
  const cacheRoot = path.join(__dirname, `.cache-fetch`)
  const cachePath = path.join(__dirname, `.cache-fetch`, `files`)

  beforeAll(async () => {
    // Establish requests interception layer before all tests.
    server.listen()

    cache = await createMockCache(cachePath)
    storage.getDatabaseDir.mockReturnValue(cacheRoot)
  })

  afterAll(async () => {
    await storage.closeDatabase()
    await fs.remove(cacheRoot)
    delete global.__GATSBY

    // Clean up after all tests are done, preventing this
    // interception layer from affecting irrelevant tests.
    server.close()
  })

  beforeEach(async () => {
    // simulate a new build each run
    global.__GATSBY = {
      buildId: global.__GATSBY?.buildId
        ? String(Number(global.__GATSBY.buildId) + 1)
        : `1`,
    }
    gotStream.mockClear()
    fsMove.mockClear()
    urlCount.clear()

    await fs.remove(cachePath)
    await fs.ensureDir(cachePath)
  })

  it(`downloads and create a svg file`, async () => {
    const filePath = await fetchRemoteFile({
      url: `http://external.com/logo.svg`,
      cache,
    })

    expect(path.basename(filePath)).toBe(`logo.svg`)
    expect(gotStream).toBeCalledTimes(1)
  })

  it(`downloads and create a gzip file`, async () => {
    const filePath = await fetchRemoteFile({
      url: `http://external.com/logo-gzip.svg`,
      cache,
    })

    expect(path.basename(filePath)).toBe(`logo-gzip.svg`)
    expect(getFileSize(filePath)).resolves.toBe(
      await getFileSize(path.join(__dirname, `./fixtures/gatsby-logo.svg`))
    )
    expect(gotStream).toBeCalledTimes(1)
  })

  it(`downloads and create a jpg file`, async () => {
    const filePath = await fetchRemoteFile({
      url: `http://external.com/dog.jpg`,
      cache,
    })

    expect(path.basename(filePath)).toBe(`dog.jpg`)
    expect(getFileSize(filePath)).resolves.toBe(
      await getFileSize(path.join(__dirname, `./fixtures/dog-thumbnail.jpg`))
    )
    expect(gotStream).toBeCalledTimes(1)
  })

  it(`downloads and create a jpg file for unknown extension`, async () => {
    const filePath = await fetchRemoteFile({
      url: `http://external.com/dog`,
      cache,
    })

    expect(path.basename(filePath)).toBe(`dog.jpg`)
    expect(getFileSize(filePath)).resolves.toBe(
      await getFileSize(path.join(__dirname, `./fixtures/dog-thumbnail.jpg`))
    )
    expect(gotStream).toBeCalledTimes(1)
  })

  it(`downloads and create a jpg file that has invalid characters`, async () => {
    const filePath = await fetchRemoteFile({
      url: `http://external.com/invalid:dog*name.jpg`,
      cache,
    })

    expect(path.basename(filePath, `.js`)).toContain(`invalid-dog-name`)
    expect(getFileSize(filePath)).resolves.toBe(
      await getFileSize(path.join(__dirname, `./fixtures/dog-thumbnail.jpg`))
    )
    expect(gotStream).toBeCalledTimes(1)
  })

  it(`doesn't retry when no content-length is given`, async () => {
    const filePath = await fetchRemoteFile({
      url: `http://external.com/logo-gzip.svg?attempts=1&maxBytes=300&contentLength=false`,
      cache,
    })

    expect(path.basename(filePath)).toBe(`logo-gzip.svg`)
    expect(getFileSize(filePath)).resolves.not.toBe(
      await getFileSize(path.join(__dirname, `./fixtures/gatsby-logo.svg`))
    )
    expect(gotStream).toBeCalledTimes(1)
  })

  it(`does not request same url during the same build`, async () => {
    const filePath = await fetchRemoteFile({
      url: `http://external.com/logo.svg`,
      cache,
    })
    const cachedFilePath = await fetchRemoteFile({
      url: `http://external.com/logo.svg`,
      cache,
    })

    expect(filePath).toBe(cachedFilePath)
    expect(path.basename(filePath)).toBe(`logo.svg`)
    expect(gotStream).toBeCalledTimes(1)
  })

  it(`handles 304 responses correctly`, async () => {
    const currentGlobal = global.__GATSBY
    global.__GATSBY = { buildId: `304-1` }
    const filePath = await fetchRemoteFile({
      url: `http://external.com/dog-304.jpg`,
      directory: cachePath,
    })

    global.__GATSBY = { buildId: `304-2` }
    const filePathCached = await fetchRemoteFile({
      url: `http://external.com/dog-304.jpg`,
      directory: cachePath,
    })

    expect(filePathCached).toBe(filePath)
    expect(fsMove).toBeCalledTimes(1)
    expect(gotStream).toBeCalledTimes(2)
    global.__GATSBY = currentGlobal
  })

  it(`handles 304 responses correctly when file does not exists`, async () => {
    const currentGlobal = global.__GATSBY
    global.__GATSBY = { buildId: `304-3` }
    const filePath = await fetchRemoteFile({
      url: `http://external.com/dog-304.jpg`,
      directory: cachePath,
    })

    await fs.remove(filePath)

    global.__GATSBY = { buildId: `304-4` }
    const filePathCached = await fetchRemoteFile({
      url: `http://external.com/dog-304.jpg`,
      directory: cachePath,
    })

    expect(filePathCached).toBe(filePath)
    expect(fsMove).toBeCalledTimes(2)
    expect(gotStream).toBeCalledTimes(2)
    global.__GATSBY = currentGlobal
  })

  it(`fails when 404 is triggered`, async () => {
    await expect(
      fetchRemoteFile({
        url: `http://external.com/404.jpg`,
        cache,
      })
    ).rejects.toThrow(`Response code 404 (Not Found)`)
  })

  it(`fails when 500 is triggered`, async () => {
    await expect(
      fetchRemoteFile({
        url: `http://external.com/500.jpg`,
        cache,
      })
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
"Unable to fetch:
http://external.com/500.jpg
---
Reason: Response code 500 (Internal Server Error)
---
Fetch details:
{
  \\"attempt\\": 3,
  \\"method\\": \\"GET\\",
  \\"errorCode\\": \\"ERR_NON_2XX_3XX_RESPONSE\\",
  \\"responseStatusCode\\": 500,
  \\"responseStatusMessage\\": \\"Internal Server Error\\",
  \\"requestHeaders\\": {
    \\"user-agent\\": \\"got (https://github.com/sindresorhus/got)\\",
    \\"accept-encoding\\": \\"gzip, deflate, br\\"
  },
  \\"responseHeaders\\": {
    \\"x-powered-by\\": \\"msw\\",
    \\"content-length\\": \\"12\\",
    \\"content-type\\": \\"text/html\\"
  }
}
---"
`)
  })

  describe(`retries the download`, () => {
    it(`Retries when gzip compression file is incomplete`, async () => {
      const filePath = await fetchRemoteFile({
        url: `http://external.com/logo-gzip.svg?attempts=1&maxBytes=300`,
        cache,
      })

      expect(path.basename(filePath)).toBe(`logo-gzip.svg`)
      expect(getFileSize(filePath)).resolves.toBe(
        await getFileSize(path.join(__dirname, `./fixtures/gatsby-logo.svg`))
      )
      expect(gotStream).toBeCalledTimes(2)
    })

    it(`Retries when binary file is incomplete`, async () => {
      const filePath = await fetchRemoteFile({
        url: `http://external.com/dog.jpg?attempts=1&maxBytes=300`,
        cache,
      })

      expect(path.basename(filePath)).toBe(`dog.jpg`)
      expect(getFileSize(filePath)).resolves.toBe(
        await getFileSize(path.join(__dirname, `./fixtures/dog-thumbnail.jpg`))
      )
      expect(gotStream).toBeCalledTimes(2)
    })

    it(`Retries when server returns 503 error till server returns 200`, async () => {
      const fetchRemoteFileInstance = fetchRemoteFile({
        url: `http://external.com/503-twice.svg`,
        cache,
      })

      const filePath = await fetchRemoteFileInstance

      expect(path.basename(filePath)).toBe(`503-twice.svg`)
      expect(getFileSize(filePath)).resolves.toBe(
        await getFileSize(path.join(__dirname, `./fixtures/gatsby-logo.svg`))
      )
      expect(gotStream).toBeCalledTimes(3)
    })

    it(`Stops retry when maximum attempts is reached`, async () => {
      await expect(
        fetchRemoteFile({
          url: `http://external.com/503-forever.svg`,
          cache,
        })
      ).rejects.toThrowErrorMatchingInlineSnapshot(`
"Unable to fetch:
http://external.com/503-forever.svg
---
Reason: Response code 503 (Service Unavailable)
---
Fetch details:
{
  \\"attempt\\": 3,
  \\"method\\": \\"GET\\",
  \\"errorCode\\": \\"ERR_NON_2XX_3XX_RESPONSE\\",
  \\"responseStatusCode\\": 503,
  \\"responseStatusMessage\\": \\"Service Unavailable\\",
  \\"requestHeaders\\": {
    \\"user-agent\\": \\"got (https://github.com/sindresorhus/got)\\",
    \\"accept-encoding\\": \\"gzip, deflate, br\\"
  },
  \\"responseHeaders\\": {
    \\"x-powered-by\\": \\"msw\\",
    \\"content-length\\": \\"12\\",
    \\"content-type\\": \\"text/html\\"
  }
}
---"
`)

      expect(gotStream).toBeCalledTimes(3)
    })
    // @todo retry on network errors
    it(`Retries on network errors`, async () => {
      await expect(
        fetchRemoteFile({
          url: `http://external.com/network-error.svg`,
          cache,
        })
      ).rejects.toThrowErrorMatchingInlineSnapshot(`
"Unable to fetch:
http://external.com/network-error.svg
---
Reason: ECONNREFUSED
---
Fetch details:
{
  \\"attempt\\": 3,
  \\"method\\": \\"GET\\",
  \\"errorCode\\": \\"ERR_GOT_REQUEST_ERROR\\",
  \\"requestHeaders\\": {
    \\"user-agent\\": \\"got (https://github.com/sindresorhus/got)\\",
    \\"accept-encoding\\": \\"gzip, deflate, br\\"
  }
}
---"
`)

      expect(gotStream).toBeCalledTimes(3)
    })
  })
})
