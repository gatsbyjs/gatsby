import path from "path"
import type { Actions, Store } from "gatsby"
import { publicUrlResolver } from "../index"
import { generateFileUrl } from "../utils/url-generator"
import * as dispatchers from "../jobs/dispatchers"

jest
  .spyOn(dispatchers, `shouldDispatchLocalFileServiceJob`)
  .mockImplementation(() => false)

const store = {
  getState: (): { requestHeaders: Map<string, Record<string, string>> } => {
    return {
      requestHeaders: new Map(),
    }
  },
} as unknown as Store

describe(`publicResolver`, () => {
  const actions = {} as Actions

  it(`should return a file based url`, () => {
    const source = {
      id: `1`,
      mimeType: `application/pdf`,
      url: `https://example.com/file.pdf`,
      filename: `file.pdf`,
      parent: null,
      children: [],
      internal: {
        type: `Test`,
        owner: `test`,
        contentDigest: `1`,
      },
    }

    expect(publicUrlResolver(source, actions)).toEqual(
      generateFileUrl({
        filename: source.filename,
        url: source.url,
        mimeType: source.mimeType,
        internal: {
          contentDigest: source.internal.contentDigest,
        },
      })
    )
  })

  it(`should return an image based url`, () => {
    const source = {
      id: `1`,
      mimeType: `image/jpeg`,
      url: `https://example.com/image.jpg`,
      filename: `image.jpg`,
      parent: null,
      children: [],
      internal: {
        type: `Test`,
        owner: `test`,
        contentDigest: `1`,
      },
    }

    expect(publicUrlResolver(source, actions)).toEqual(
      generateFileUrl({
        filename: source.filename,
        url: source.url,
        mimeType: source.mimeType,
        internal: {
          contentDigest: source.internal.contentDigest,
        },
      })
    )
  })

  it(`should dispatch a file job if it's a file`, () => {
    const actions = {
      createJobV2: jest.fn(() => jest.fn()),
    }

    dispatchers.shouldDispatchLocalFileServiceJob.mockImplementationOnce(
      () => true
    )

    const source = {
      id: `1`,
      mimeType: `image/jpeg`,
      url: `https://example.com/my-report.pdf`,
      filename: `my-report.pdf`,
      parent: null,
      children: [],
      internal: {
        type: `Test`,
        owner: `test`,
        contentDigest: `1`,
      },
    }
    publicUrlResolver(source, actions, store)
    expect(actions.createJobV2).toHaveBeenCalledWith(
      expect.objectContaining({
        args: {
          contentDigest: `1`,
          filename: expect.any(String),
          url: source.url,
        },
        inputPaths: [],
        name: `FILE_CDN`,
        outputDir: expect.stringContaining(
          path.join(`public`, `_gatsby`, `file`)
        ),
      }),
      expect.any(Object)
    )
  })

  it(`should dispatch a file job if it's an image`, () => {
    const actions = {
      createJobV2: jest.fn(() => jest.fn()),
    }
    dispatchers.shouldDispatchLocalFileServiceJob.mockImplementationOnce(
      () => true
    )

    const source = {
      id: `1`,
      mimeType: `image/jpeg`,
      url: `https://example.com/image.jpg`,
      filename: `image.jpg`,
      width: 300,
      height: 300,
      parent: null,
      children: [],
      internal: {
        type: `Test`,
        owner: `test`,
        contentDigest: `1`,
      },
    }
    publicUrlResolver(source, actions, store)
    expect(actions.createJobV2).toHaveBeenCalledWith(
      expect.objectContaining({
        args: {
          contentDigest: `1`,
          filename: expect.any(String),
          url: source.url,
        },
        inputPaths: [],
        name: `FILE_CDN`,
        outputDir: expect.stringContaining(
          path.join(`public`, `_gatsby`, `file`)
        ),
      }),
      expect.any(Object)
    )
  })

  it(`should dispatch with decoded filename`, () => {
    const actions = {
      createJobV2: jest.fn(() => jest.fn()),
    }

    dispatchers.shouldDispatchLocalFileServiceJob.mockImplementationOnce(
      () => true
    )

    const file = {
      id: `1`,
      mimeType: `image/jpeg`,
      url: `https://example.com/my report.pdf`,
      filename: `my report.pdf`,
      parent: null,
      children: [],
      internal: {
        type: `Test`,
        owner: `test`,
        contentDigest: `1`,
      },
    }
    publicUrlResolver(file, actions, store)
    expect(actions.createJobV2).toHaveBeenCalledWith(
      expect.objectContaining({
        args: {
          contentDigest: `1`,
          filename: expect.stringContaining(`my report.pdf`),
          url: file.url,
        },
        inputPaths: [],
        name: `FILE_CDN`,
        outputDir: expect.stringContaining(
          path.join(`public`, `_gatsby`, `file`)
        ),
      }),
      expect.any(Object)
    )
  })
})
