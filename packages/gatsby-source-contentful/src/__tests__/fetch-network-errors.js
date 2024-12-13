/**
 * @jest-environment node
 */
// @ts-check

import nock from "nock"
import { fetchContent } from "../fetch"
import { createPluginConfig } from "../plugin-options"

nock.disableNetConnect()

const host = `localhost`
const options = {
  spaceId: `12345`,
  accessToken: `67890`,
  host,
  contentfulClientConfig: {
    retryLimit: 2,
  },
}
const baseURI = `https://${host}`

const start = jest.fn()
const end = jest.fn()
const mockActivity = {
  start,
  end,
  tick: jest.fn(),
  done: end,
}

const reporter = {
  info: jest.fn(),
  verbose: jest.fn(),
  panic: jest.fn(e => {
    throw e
  }),
  activityTimer: jest.fn(() => mockActivity),
  createProgress: jest.fn(() => mockActivity),
}

const pluginConfig = createPluginConfig(options)

describe(`fetch-retry`, () => {
  afterEach(() => {
    nock.cleanAll()
    reporter.verbose.mockClear()
    reporter.panic.mockClear()
  })

  test(`request retries when network timeout happens`, async () => {
    const scope = nock(baseURI)
      // Space
      .get(`/spaces/${options.spaceId}/`)
      .reply(200, { items: [] })
      // Locales
      .get(`/spaces/${options.spaceId}/environments/master/locales`)
      .reply(200, { items: [{ code: `en`, default: true }] })
      // Sync
      .get(
        `/spaces/${options.spaceId}/environments/master/sync?initial=true&limit=1000`
      )
      .times(1)
      .replyWithError({ code: `ETIMEDOUT` })
      .get(
        `/spaces/${options.spaceId}/environments/master/sync?initial=true&limit=1000`
      )
      .reply(200, { items: [] })

    await fetchContent({ pluginConfig, reporter, syncToken: null })

    expect(reporter.panic).not.toBeCalled()
    expect(scope.isDone()).toBeTruthy()
  })

  test(`request should fail after to many retries`, async () => {
    // Due to the retries, this can take up to 10 seconds
    jest.setTimeout(10000)

    const scope = nock(baseURI)
      // Space
      .get(`/spaces/${options.spaceId}/`)
      .reply(200, { items: [] })
      // Locales
      .get(`/spaces/${options.spaceId}/environments/master/locales`)
      .reply(200, { items: [{ code: `en`, default: true }] })
      // Sync
      .get(
        `/spaces/${options.spaceId}/environments/master/sync?initial=true&limit=1000`
      )
      .times(3)
      .reply(
        500,
        {
          sys: {
            type: `Error`,
            id: `MockedContentfulError`,
          },
          message: `Mocked message of Contentful error`,
        },
        { [`x-contentful-request-id`]: `123abc` }
      )

    try {
      await fetchContent({ pluginConfig, reporter, syncToken: null })
      throw new Error(`fetchContent should throw an error`)
    } catch (e) {
      const msg = expect(e.context.sourceMessage)
      msg.toEqual(
        expect.stringContaining(
          `Fetching contentful data failed: ERR_BAD_RESPONSE 500 500 MockedContentfulError`
        )
      )
      msg.toEqual(expect.stringContaining(`Request ID: 123abc`))
      msg.toEqual(expect.stringContaining(`Attempts: 3`))
    }
    expect(reporter.panic).toBeCalled()
    expect(scope.isDone()).toBeTruthy()
  })
})

describe(`fetch-network-errors`, () => {
  test(`catches plain network error`, async () => {
    const scope = nock(baseURI)
      // Space
      .get(`/spaces/${options.spaceId}/`)
      .replyWithError({ code: `ECONNRESET` })
    try {
      await fetchContent({
        pluginConfig: createPluginConfig({
          ...options,
          contentfulClientConfig: { retryOnError: false },
        }),
        reporter,
        syncToken: null,
      })
      throw new Error(`fetchContent should throw an error`)
    } catch (e) {
      expect(e.context.sourceMessage).toEqual(
        expect.stringContaining(
          `Accessing your Contentful space failed: ECONNRESET`
        )
      )
    }

    expect(reporter.panic).toBeCalled()
    expect(scope.isDone()).toBeTruthy()
  })

  test(`catches error with response object`, async () => {
    const scope = nock(baseURI)
      // Space
      .get(`/spaces/${options.spaceId}/`)
      .reply(429, {
        sys: {
          type: `Error`,
          id: `MockedContentfulError`,
        },
        message: `Mocked message of Contentful error`,
        requestId: `123abc`,
      })

    try {
      await fetchContent({
        pluginConfig: createPluginConfig({
          ...options,
          contentfulClientConfig: { retryOnError: false },
        }),
        reporter,
        syncToken: null,
      })
      throw new Error(`fetchContent should throw an error`)
    } catch (e) {
      const msg = expect(e.context.sourceMessage)

      msg.toEqual(
        expect.stringContaining(
          `Accessing your Contentful space failed: MockedContentfulError`
        )
      )
      msg.toEqual(expect.stringContaining(`Mocked message of Contentful error`))
      msg.toEqual(expect.stringContaining(`Request ID: 123abc`))
    }

    expect(reporter.panic).toBeCalled()
    expect(scope.isDone()).toBeTruthy()
  })
})
