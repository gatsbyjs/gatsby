/**
 * @jest-environment node
 */

import nock from "nock"

import downloadAndRetry from "../download-with-retry"

nock.disableNetConnect()

const host = `https://images.ctfassets.net`
const path = `/foo/bar/baz/image.jpg`
const url = [host, path].join(``)

const reporter = {
  verbose: jest.fn(),
}

describe(`download-with-retry`, () => {
  afterEach(() => {
    nock.cleanAll()
    reporter.verbose.mockClear()
  })

  test(`resolves regular response`, async () => {
    const scope = nock(host).get(path).reply(200)

    await downloadAndRetry({ method: `get`, url }, reporter)

    expect(reporter.verbose).not.toHaveBeenCalled()
    expect(scope.isDone()).toBeTruthy()
  })

  test(`does not retry for no reason`, async () => {
    const scope = nock(host).get(path).twice().reply(200)

    await downloadAndRetry({ method: `get`, url }, reporter)

    expect(reporter.verbose).not.toHaveBeenCalled()
    expect(scope.isDone()).toBeFalsy()
  })

  test(`does not retry on 404`, async () => {
    const scope = nock(host).get(path).twice().reply(404)

    await expect(
      downloadAndRetry({ method: `get`, url }, reporter)
    ).rejects.toThrowError(
      `Unable to download asset from https://images.ctfassets.net/foo/bar/baz/image.jpg. Request failed with status code 404`
    )

    expect(reporter.verbose).not.toHaveBeenCalled()
    expect(scope.isDone()).toBeFalsy()
    scope.persist(false)
  })

  test(`does retry on 503`, async () => {
    const scope = nock(host).get(path).twice().reply(503).get(path).reply(200)

    await downloadAndRetry({ method: `get`, url }, reporter)

    expect(reporter.verbose).toHaveBeenCalledTimes(2)
    expect(reporter.verbose).toHaveBeenCalledWith(
      `Retry attempt #1 for https://images.ctfassets.net/foo/bar/baz/image.jpg`
    )
    expect(reporter.verbose).toHaveBeenCalledWith(
      `Retry attempt #2 for https://images.ctfassets.net/foo/bar/baz/image.jpg`
    )
    expect(scope.isDone()).toBeTruthy()
  })

  test(`stops retry after 3 attempts`, async () => {
    const scope = nock(host).get(path).times(4).reply(503)

    await expect(
      downloadAndRetry({ method: `get`, url }, reporter)
    ).rejects.toThrowError(
      `Unable to download asset from https://images.ctfassets.net/foo/bar/baz/image.jpg. Request failed with status code 503`
    )

    expect(reporter.verbose).toHaveBeenCalledTimes(3)
    expect(reporter.verbose).toHaveBeenCalledWith(
      `Retry attempt #3 for https://images.ctfassets.net/foo/bar/baz/image.jpg`
    )
    expect(scope.isDone()).toBeTruthy()
  })
})
