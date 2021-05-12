import * as path from "path"
import * as zlib from "zlib"
import * as os from "os"
import { rest } from "msw"
import { setupServer } from "msw/node"
import { Writable } from "stream"
import got from "got"
import createRemoteFileNode from "../create-remote-file-node"

const fs = jest.requireActual(`fs-extra`)

const gotStream = jest.spyOn(got, `stream`)
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
 * @param {{ compress: boolean}} options Options for the getFilecontent (use gzip or not)
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
        : fileContentBuffer.length,
  }
}

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
      ctx.set(`Content-Type`, `image/svg+xml`),
      ctx.set(`Content-Length`, contentLength),
      ctx.status(200),
      ctx.body(content)
    )
  })
)

function createMockCache() {
  const tmpDir = fs.mkdtempSync(
    path.join(os.tmpdir(), `gatsby-source-filesystem-`)
  )

  return {
    get: jest.fn(),
    set: jest.fn(),
    directory: tmpDir,
  }
}

const reporter = jest.fn(() => {
  return {}
})

describe(`create-remote-file-node`, () => {
  let cache

  beforeAll(() => {
    cache = createMockCache()
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
    urlCount.clear()
  })

  it(`downloads and create a file`, async () => {
    const fileNode = await createRemoteFileNode({
      url: `http://external.com/logo.svg`,
      store: {},
      getCache: () => cache,
      createNode: jest.fn(),
      createNodeId: jest.fn(),
      reporter,
    })

    expect(fileNode.base).toBe(`logo.svg`)
    expect(fileNode.size).toBe(
      await getFileSize(path.join(__dirname, `./fixtures/gatsby-logo.svg`))
    )
    expect(gotStream).toBeCalledTimes(1)
  })

  it(`downloads and create a gzip file`, async () => {
    const fileNode = await createRemoteFileNode({
      url: `http://external.com/logo-gzip.svg`,
      store: {},
      getCache: () => cache,
      createNode: jest.fn(),
      createNodeId: jest.fn(),
      reporter,
    })

    expect(fileNode.base).toBe(`logo-gzip.svg`)
    expect(fileNode.size).toBe(
      await getFileSize(path.join(__dirname, `./fixtures/gatsby-logo.svg`))
    )
    expect(gotStream).toBeCalledTimes(1)
  })

  it(`downloads and create a file`, async () => {
    const fileNode = await createRemoteFileNode({
      url: `http://external.com/dog.jpg`,
      store: {},
      getCache: () => cache,
      createNode: jest.fn(),
      createNodeId: jest.fn(),
      reporter,
    })

    expect(fileNode.base).toBe(`dog.jpg`)
    expect(fileNode.size).toBe(
      await getFileSize(path.join(__dirname, `./fixtures/dog-thumbnail.jpg`))
    )
    expect(gotStream).toBeCalledTimes(1)
  })

  it(`doesn't retry when no content-length is given`, async () => {
    const fileNode = await createRemoteFileNode({
      url: `http://external.com/logo-gzip.svg?attempts=1&maxBytes=300&contentLength=false`,
      store: {},
      getCache: () => cache,
      createNode: jest.fn(),
      createNodeId: jest.fn(),
      reporter,
    })

    expect(fileNode.base).toBe(`logo-gzip.svg`)
    expect(fileNode.size).not.toBe(
      await getFileSize(path.join(__dirname, `./fixtures/gatsby-logo.svg`))
    )
    expect(gotStream).toBeCalledTimes(1)
  })

  // FIXME: somehow it only fails on Windows with node 14+. Node 12 works :shrug:
  describe.skip(`retries the download`, () => {
    it(`Retries when gzip compression file is incomplete`, async () => {
      const fileNode = await createRemoteFileNode({
        url: `http://external.com/logo-gzip.svg?attempts=1&maxBytes=300`,
        store: {},
        getCache: () => cache,
        createNode: jest.fn(),
        createNodeId: jest.fn(),
        reporter,
      })

      expect(fileNode.base).toBe(`logo-gzip.svg`)
      expect(fileNode.size).toBe(
        await getFileSize(path.join(__dirname, `./fixtures/gatsby-logo.svg`))
      )
      expect(gotStream).toBeCalledTimes(2)
    })

    it(`Retries when binary file is incomplete`, async () => {
      const fileNode = await createRemoteFileNode({
        url: `http://external.com/dog.jpg?attempts=1&maxBytes=300`,
        store: {},
        getCache: () => cache,
        createNode: jest.fn(),
        createNodeId: jest.fn(),
        reporter,
      })

      expect(fileNode.base).toBe(`dog.jpg`)
      expect(fileNode.size).toBe(
        await getFileSize(path.join(__dirname, `./fixtures/dog-thumbnail.jpg`))
      )
      expect(gotStream).toBeCalledTimes(2)
    })
  })
})
