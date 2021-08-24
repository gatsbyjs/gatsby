/**
 * @jest-environment node
 */

import os from "os"
import fs from "fs-extra"
import path from "path"

import nock from "nock"

import { fetchContentfulAsset } from "../fetch-contentful-asset"

nock.disableNetConnect()

const reporter = {
  verbose: jest.fn(),
}

function createMockCache() {
  const tmpDir = fs.mkdtempSync(
    path.join(os.tmpdir(), `gatsby-source-contentful-`)
  )

  return {
    get: jest.fn(),
    set: jest.fn(),
    directory: tmpDir,
  }
}

let cache
const host = `https://images.ctfassets.net`

describe(`fetch-contentful-assets`, () => {
  beforeAll(async () => {
    cache = createMockCache()
    await fs.ensureDir(cache.directory)
  })

  afterAll(async () => {
    if (cache) {
      await fs.remove(cache.directory)
    }
  })

  afterEach(() => {
    nock.cleanAll()
    reporter.verbose.mockClear()
  })

  it(`resolves regular response`, async () => {
    const path = `/resolves.jpg`
    const url = [host, path].join(``)
    const scope = nock(host).get(path).reply(200)

    await fetchContentfulAsset({ url, reporter, cache })

    expect(reporter.verbose).not.toHaveBeenCalled()
    expect(scope.isDone()).toBeTruthy()
  })

  it(`returns from cache on second call`, async () => {
    const path = `/resolves-from-cache.jpg`
    const url = [host, path].join(``)
    const scope = nock(host).get(path).twice().reply(200)

    await fetchContentfulAsset({ url, reporter, cache })
    await fetchContentfulAsset({ url, reporter, cache })

    expect(reporter.verbose).not.toHaveBeenCalled()
    expect(scope.isDone()).toBeFalsy()
    expect(scope.pendingMocks()).toEqual([
      `GET https://images.ctfassets.net:443/resolves-from-cache.jpg`,
    ])
  })

  it(`does not retry for no reason`, async () => {
    const path = `/no-retry.jpg`
    const url = [host, path].join(``)
    const scope = nock(host).get(path).twice().reply(200)

    await fetchContentfulAsset({ url, reporter, cache })

    expect(reporter.verbose).not.toHaveBeenCalled()
    expect(scope.isDone()).toBeFalsy()
  })

  it(`does not retry on 404`, async () => {
    const path = `/no-retry-on-404.jpg`
    const url = [host, path].join(``)
    const scope = nock(host).get(path).twice().reply(404)

    await expect(fetchContentfulAsset({ url, reporter, cache })).rejects
      .toThrowErrorMatchingInlineSnapshot(`
"Unable to fetch Contentful asset:
https://images.ctfassets.net/no-retry-on-404.jpg
---
Reason: Response code 404 (Not Found)
---
Details:
{\\"statusCode\\":404}
---"
`)

    expect(reporter.verbose).not.toHaveBeenCalled()
    expect(scope.isDone()).toBeFalsy()
    expect(scope.pendingMocks()).toEqual([
      `GET https://images.ctfassets.net:443/no-retry-on-404.jpg`,
    ])
  })

  it(`does retry on 503`, async () => {
    const path = `/retry-on-503.jpg`
    const url = [host, path].join(``)

    const scope = nock(host).get(path).twice().reply(503).get(path).reply(200)

    await fetchContentfulAsset({ url, reporter, cache })

    expect(reporter.verbose.mock.calls).toEqual([
      [
        `Failed to fetch https://images.ctfassets.net/retry-on-503.jpg due to 503 error. Attempt #1.`,
      ],
      [
        `Failed to fetch https://images.ctfassets.net/retry-on-503.jpg due to 503 error. Attempt #2.`,
      ],
    ])
    expect(scope.isDone()).toBeTruthy()
  })

  it(`stops retry after 3 attempts`, async () => {
    jest.setTimeout(10000)
    const path = `/stop-retry-after-3-attempts.jpg`
    const url = [host, path].join(``)

    const scope = nock(host).get(path).times(3).reply(503)

    await expect(fetchContentfulAsset({ url, reporter, cache })).rejects
      .toThrowErrorMatchingInlineSnapshot(`
"Unable to fetch Contentful asset:
https://images.ctfassets.net/stop-retry-after-3-attempts.jpg
---
Reason: Exceeded maximum retry attempts (3)
---"
`)

    expect(reporter.verbose.mock.calls).toEqual([
      [
        `Failed to fetch https://images.ctfassets.net/stop-retry-after-3-attempts.jpg due to 503 error. Attempt #1.`,
      ],
      [
        `Failed to fetch https://images.ctfassets.net/stop-retry-after-3-attempts.jpg due to 503 error. Attempt #2.`,
      ],
      [
        `Failed to fetch https://images.ctfassets.net/stop-retry-after-3-attempts.jpg due to 503 error. Attempt #3. Retry limit reached. Aborting.`,
      ],
    ])
    expect(scope.pendingMocks()).toHaveLength(0)
    expect(scope.isDone()).toBeTruthy()
  })

  it(`retries on network errors`, async () => {
    jest.setTimeout(5000)

    const path = `/network-errors.jpg`
    const url = [host, path].join(``)
    const scope = nock(host)
      .get(path)
      .delay({ head: 1000, body: 1000 })
      .replyWithError({ code: `ECONNRESET` })
      .get(path)
      .reply(200)

    await fetchContentfulAsset({ url, reporter, cache })

    expect(reporter.verbose).toHaveBeenCalledWith(
      `Failed to fetch https://images.ctfassets.net/network-errors.jpg due to ECONNRESET error. Attempt #1.`
    )
    expect(reporter.verbose).toHaveBeenCalledTimes(1)
    expect(scope.isDone()).toBeTruthy()
  })
})
