import path from "path"
import type { Store } from "gatsby"
import importFrom from "import-from"
import { publicUrlResolver } from "../index"
import * as dispatchers from "../jobs/dispatchers"
// import { fetchRemoteFile } from "gatsby-core-utils/fetch-remote-file"

jest.spyOn(dispatchers, `shouldDispatch`).mockImplementation(() => false)
jest.mock(`import-from`)

describe(`publicResolver`, () => {
  const store = {} as Store

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

    expect(publicUrlResolver(source, store)).toEqual(
      `/_gatsby/file/${Buffer.from(source.url).toString(`base64`)}.pdf`
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

    expect(publicUrlResolver(source, store)).toEqual(
      `/_gatsby/file/${Buffer.from(source.url).toString(`base64`)}.jpg`
    )
  })

  it(`should dispatch a file job if it's a file`, () => {
    const actions = {
      createJobV2: jest.fn(() => jest.fn()),
    }
    dispatchers.shouldDispatch.mockImplementationOnce(() => true)
    importFrom.mockImplementation(() => actions)

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
    publicUrlResolver(source, store)
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
    dispatchers.shouldDispatch.mockImplementationOnce(() => true)
    importFrom.mockImplementation(() => actions)

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
    publicUrlResolver(source, store)
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
})
