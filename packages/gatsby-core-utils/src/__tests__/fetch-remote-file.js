// @ts-check

import path from "path"
import zlib from "zlib"
import os from "os"
import { rest } from "msw"
import { setupServer } from "msw/node"
import { Writable } from "stream"
import got from "got"
import fs from "fs-extra"

const gotStream = jest.spyOn(got, `stream`)
const fsMove = jest.spyOn(fs, `move`)
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
  rest.get(`http://external.com/dog-304.jpg`, async (req, res, ctx) => {
    const { content, contentLength } = await getFileContent(
      path.join(__dirname, `./fixtures/dog-thumbnail.jpg`),
      req
    )

    // console.log(req.headers)

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

function getFetchInWorkerContext(workerId) {
  let fetchRemoteInstance
  jest.isolateModules(() => {
    const send = process.send
    process.env.GATSBY_WORKER_ID = workerId
    process.send = jest.fn()
    process.env.GATSBY_WORKER_MODULE_PATH = `123`

    fetchRemoteInstance = require(`../fetch-remote-file`).fetchRemoteFile

    delete process.env.GATSBY_WORKER_MODULE_PATH
    delete process.env.GATSBY_WORKER_ID
    process.send = send
  })

  return fetchRemoteInstance
}

async function createMockCache() {
  const tmpDir = fs.mkdtempSync(
    path.join(os.tmpdir(), `gatsby-source-filesystem-`)
  )

  fs.ensureDir(tmpDir)

  return {
    get: jest.fn(() => Promise.resolve(null)),
    set: jest.fn(() => Promise.resolve(null)),
    directory: tmpDir,
  }
}

describe(`fetch-remote-file`, () => {
  let cache
  let fetchRemoteFile

  beforeAll(async () => {
    cache = await createMockCache()
    // Establish requests interception layer before all tests.
    server.listen()
  })
  afterAll(() => {
    if (cache) {
      fs.removeSync(cache.directory)
    }

    // Clean up after all tests are done, preventing this
    // interception layer from affecting irrelevant tests.
    server.close()
  })

  beforeEach(() => {
    gotStream.mockClear()
    fsMove.mockClear()
    urlCount.clear()

    jest.isolateModules(() => {
      // we need to bypass the cache for each test
      fetchRemoteFile = require(`../fetch-remote-file`).fetchRemoteFile
    })
  })

  afterEach(() => {
    jest.useRealTimers()
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

  it(`only writes the file once when multiple workers fetch at the same time`, async () => {
    // we don't want to wait for polling to finish
    jest.useFakeTimers()
    jest.runAllTimers()

    const cacheInternals = new Map()
    const workerCache = {
      get(key) {
        return Promise.resolve(cacheInternals.get(key))
      },
      set(key, value) {
        return Promise.resolve(cacheInternals.set(key, value))
      },
      directory: cache.directory,
    }

    const fetchRemoteFileInstanceOne = getFetchInWorkerContext(`1`)
    const fetchRemoteFileInstanceTwo = getFetchInWorkerContext(`2`)

    const requests = [
      fetchRemoteFileInstanceOne({
        url: `http://external.com/logo.svg`,
        cache: workerCache,
      }),
      fetchRemoteFileInstanceTwo({
        url: `http://external.com/logo.svg`,
        cache: workerCache,
      }),
    ]

    // reverse order as last writer wins
    await requests[1]
    jest.runAllTimers()
    await requests[0]

    // we still expect 2 fetches because cache can't save fast enough
    expect(gotStream).toBeCalledTimes(2)
    expect(fsMove).toBeCalledTimes(1)
  })

  it(`it clears the mutex cache when new build id is present`, async () => {
    // we don't want to wait for polling to finish
    jest.useFakeTimers()
    jest.runAllTimers()

    const cacheInternals = new Map()
    const workerCache = {
      get(key) {
        return Promise.resolve(cacheInternals.get(key))
      },
      set(key, value) {
        return Promise.resolve(cacheInternals.set(key, value))
      },
      directory: cache.directory,
    }

    const fetchRemoteFileInstanceOne = getFetchInWorkerContext(`1`)
    const fetchRemoteFileInstanceTwo = getFetchInWorkerContext(`2`)

    global.__GATSBY = { buildId: `1` }
    let requests = [
      fetchRemoteFileInstanceOne({
        url: `http://external.com/logo.svg`,
        cache: workerCache,
      }),
      fetchRemoteFileInstanceTwo({
        url: `http://external.com/logo.svg`,
        cache: workerCache,
      }),
    ]

    // reverse order as last writer wins
    await requests[1]
    jest.runAllTimers()
    await requests[0]
    jest.runAllTimers()

    global.__GATSBY = { buildId: `2` }
    requests = [
      fetchRemoteFileInstanceOne({
        url: `http://external.com/logo.svg`,
        cache: workerCache,
      }),
      fetchRemoteFileInstanceTwo({
        url: `http://external.com/logo.svg`,
        cache: workerCache,
      }),
    ]

    // reverse order as last writer wins
    await requests[1]
    jest.runAllTimers()
    await requests[0]

    // we still expect 4 fetches because cache can't save fast enough
    expect(gotStream).toBeCalledTimes(4)
    expect(fsMove).toBeCalledTimes(2)
  })

  it(`handles 304 responses correctly in different builds`, async () => {
    const cacheInternals = new Map()
    const workerCache = {
      get(key) {
        return Promise.resolve(cacheInternals.get(key))
      },
      set(key, value) {
        return Promise.resolve(cacheInternals.set(key, value))
      },
      directory: cache.directory,
    }

    global.__GATSBY = { buildId: `1` }
    const filePath = await fetchRemoteFile({
      url: `http://external.com/dog-304.jpg`,
      cache: workerCache,
    })

    global.__GATSBY = { buildId: `2` }
    const filePathCached = await fetchRemoteFile({
      url: `http://external.com/dog-304.jpg`,
      cache: workerCache,
    })

    expect(filePathCached).toBe(filePath)
    expect(fsMove).toBeCalledTimes(1)
    expect(gotStream).toBeCalledTimes(2)
  })

  it(`doesn't keep lock when file download failed`, async () => {
    const cacheInternals = new Map()
    const workerCache = {
      get(key) {
        return Promise.resolve(cacheInternals.get(key))
      },
      set(key, value) {
        return Promise.resolve(cacheInternals.set(key, value))
      },
      directory: cache.directory,
    }

    const fetchRemoteFileInstanceOne = getFetchInWorkerContext(`1`)
    const fetchRemoteFileInstanceTwo = getFetchInWorkerContext(`2`)

    await expect(
      fetchRemoteFileInstanceOne({
        url: `http://external.com/500.jpg`,
        cache: workerCache,
      })
    ).rejects.toThrow()

    await expect(
      fetchRemoteFileInstanceTwo({
        url: `http://external.com/500.jpg`,
        cache: workerCache,
      })
    ).rejects.toThrow()

    expect(gotStream).toBeCalledTimes(3)
    expect(fsMove).toBeCalledTimes(0)
  })

  it(`downloading a file in main process after downloading it in worker`, async () => {
    // we don't want to wait for polling to finish
    jest.useFakeTimers()
    jest.runAllTimers()

    const cacheInternals = new Map()
    const workerCache = {
      get(key) {
        return Promise.resolve(cacheInternals.get(key))
      },
      set(key, value) {
        return Promise.resolve(cacheInternals.set(key, value))
      },
      directory: cache.directory,
    }

    const fetchRemoteFileInstanceOne = getFetchInWorkerContext(`1`)

    const resultFromWorker = await fetchRemoteFileInstanceOne({
      url: `http://external.com/logo.svg`,
      cache: workerCache,
    })

    jest.runAllTimers()

    const resultFromMain = await fetchRemoteFile({
      url: `http://external.com/logo.svg`,
      cache: workerCache,
    })

    expect(resultFromWorker).not.toBeUndefined()
    expect(resultFromMain).not.toBeUndefined()

    jest.useRealTimers()

    expect(gotStream).toBeCalledTimes(1)
    expect(fsMove).toBeCalledTimes(1)
  })

  it(`downloading a file in worker process after downloading it in main`, async () => {
    // we don't want to wait for polling to finish
    jest.useFakeTimers()
    jest.runAllTimers()

    const cacheInternals = new Map()
    const workerCache = {
      get(key) {
        return Promise.resolve(cacheInternals.get(key))
      },
      set(key, value) {
        return Promise.resolve(cacheInternals.set(key, value))
      },
      directory: cache.directory,
    }

    const fetchRemoteFileInstanceOne = getFetchInWorkerContext(`1`)

    const resultFromMain = await fetchRemoteFile({
      url: `http://external.com/logo.svg`,
      cache: workerCache,
    })

    jest.runAllTimers()

    const resultFromWorker = await fetchRemoteFileInstanceOne({
      url: `http://external.com/logo.svg`,
      cache: workerCache,
    })

    jest.runAllTimers()
    jest.useRealTimers()

    expect(resultFromWorker).not.toBeUndefined()
    expect(resultFromMain).not.toBeUndefined()
    expect(gotStream).toBeCalledTimes(1)
    expect(fsMove).toBeCalledTimes(1)
  })

  it(`downloading a file in worker process after downloading it in another worker`, async () => {
    // we don't want to wait for polling to finish
    jest.useFakeTimers()
    jest.runAllTimers()

    const cacheInternals = new Map()
    const workerCache = {
      get(key) {
        return Promise.resolve(cacheInternals.get(key))
      },
      set(key, value) {
        return Promise.resolve(cacheInternals.set(key, value))
      },
      directory: cache.directory,
    }

    const fetchRemoteFileInstanceOne = getFetchInWorkerContext(`1`)
    const fetchRemoteFileInstanceTwo = getFetchInWorkerContext(`2`)

    const resultFromWorker1 = await fetchRemoteFileInstanceOne({
      url: `http://external.com/logo.svg`,
      cache: workerCache,
    })
    jest.runAllTimers()

    const resultFromWorker2 = await fetchRemoteFileInstanceTwo({
      url: `http://external.com/logo.svg`,
      cache: workerCache,
    })

    jest.runAllTimers()
    jest.useRealTimers()

    expect(resultFromWorker1).not.toBeUndefined()
    expect(resultFromWorker2).not.toBeUndefined()
    expect(gotStream).toBeCalledTimes(1)
    expect(fsMove).toBeCalledTimes(1)
  })

  it(`handles 304 responses correctly in different builds and workers`, async () => {
    const cacheInternals = new Map()
    const workerCache = {
      get(key) {
        return Promise.resolve(cacheInternals.get(key))
      },
      set(key, value) {
        return Promise.resolve(cacheInternals.set(key, value))
      },
      directory: cache.directory,
    }

    const fetchRemoteFileInstanceOne = getFetchInWorkerContext(`1`)
    const fetchRemoteFileInstanceTwo = getFetchInWorkerContext(`2`)

    global.__GATSBY = { buildId: `1` }
    const filePath = await fetchRemoteFileInstanceOne({
      url: `http://external.com/dog-304.jpg`,
      cache: workerCache,
    })

    global.__GATSBY = { buildId: `2` }
    const filePathCached = await fetchRemoteFileInstanceTwo({
      url: `http://external.com/dog-304.jpg`,
      cache: workerCache,
    })

    expect(filePathCached).toBe(filePath)
    expect(fsMove).toBeCalledTimes(1)
    expect(gotStream).toBeCalledTimes(2)
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
