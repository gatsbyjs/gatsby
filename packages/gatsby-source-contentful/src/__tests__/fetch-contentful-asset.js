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

    await expect(
      fetchContentfulAsset({ url, reporter, cache })
    ).rejects.toThrowError(
      `Unable to fetch asset from https://images.ctfassets.net/no-retry-on-404.jpg. Response code 404 (Not Found)`
    )

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
        `Failed to fetch https://images.ctfassets.net/retry-on-503.jpg due to 503 error. Failed after attempt #1.`,
      ],
      [
        `Failed to fetch https://images.ctfassets.net/retry-on-503.jpg due to 503 error. Failed after attempt #2.`,
      ],
    ])
    expect(scope.isDone()).toBeTruthy()
  })

  it(`stops retry after 3 attempts`, async () => {
    const path = `/stop-retry-after-3-attempts.jpg`
    const url = [host, path].join(``)

    const scope = nock(host).get(path).times(3).reply(503)

    await expect(
      fetchContentfulAsset({ url, reporter, cache })
    ).rejects.toThrowError(
      `Unable to fetch asset from https://images.ctfassets.net/stop-retry-after-3-attempts.jpg. Exceeded maximum retry attempts (3)`
    )

    expect(reporter.verbose.mock.calls).toEqual([
      [
        `Failed to fetch https://images.ctfassets.net/stop-retry-after-3-attempts.jpg due to 503 error. Failed after attempt #1.`,
      ],
      [
        `Failed to fetch https://images.ctfassets.net/stop-retry-after-3-attempts.jpg due to 503 error. Failed after attempt #2.`,
      ],
      [
        `Failed to fetch https://images.ctfassets.net/stop-retry-after-3-attempts.jpg due to 503 error. Failed after attempt #3. Aborting.`,
      ],
    ])
    expect(scope.pendingMocks()).toHaveLength(0)
    expect(scope.isDone()).toBeTruthy()
  })
})
