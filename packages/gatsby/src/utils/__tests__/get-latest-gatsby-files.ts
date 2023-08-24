const mockFiles = new Map<string, string>()

/* eslint-disable @typescript-eslint/no-var-requires */
jest.mock(`fs-extra`, () => {
  return {
    readJSON: jest.fn().mockImplementation(async filePath => {
      const content = mockFiles.get(filePath)

      if (content) {
        return JSON.parse(content)
      }
      throw new Error(`File not found`)
    }),
    writeFile: jest.fn().mockImplementation(async (filePath, content) => {
      mockFiles.set(filePath, content)
    }),
    pathExists: jest
      .fn()
      .mockImplementation(async filePath => mockFiles.has(filePath)),
  }
})
jest.mock(`axios`, () => {
  return {
    get: jest.fn(),
  }
})

const path = require(`path`)
const fs = require(`fs-extra`)
const axios = require(`axios`)
import { getLatestAPIs, IAPIResponse } from "../get-latest-gatsby-files"

beforeEach(() => {
  ;[fs, axios].forEach(mock =>
    Object.keys(mock).forEach(key => mock[key].mockClear())
  )
})

const getMockAPIFile = (): IAPIResponse => {
  return {
    node: {},
    browser: {},
    ssr: {},
  }
}

describe(`default behavior: has network connectivity`, () => {
  beforeEach(() => {
    axios.get.mockResolvedValueOnce({ data: getMockAPIFile() })
  })

  it(`makes a request to unpkg to request file`, async () => {
    const data = await getLatestAPIs()

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining(`unpkg.com`),
      expect.any(Object)
    )
    expect(data).toEqual(getMockAPIFile())
  })

  it(`writes apis.json file`, async () => {
    const data = await getLatestAPIs()

    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(`latest-apis.json`),
      JSON.stringify(data, null, 2),
      expect.any(String)
    )
  })
})

describe(`downloading APIs failure`, () => {
  beforeEach(() => {
    axios.get.mockRejectedValueOnce(new Error(`does not matter`))
  })

  it(`falls back to downloaded cached file, if it exists`, async () => {
    const apis = getMockAPIFile()

    const data = await getLatestAPIs()

    expect(fs.writeFile).not.toHaveBeenCalled()
    expect(fs.readJSON).toHaveBeenCalledWith(
      expect.stringContaining(`${path.sep}latest-apis.json`)
    )
    expect(data).toEqual(apis)
  })

  it(`falls back to local apis.json if latest-apis.json not cached`, async () => {
    mockFiles.clear()
    getMockAPIFile()

    await getLatestAPIs()

    expect(fs.readJSON).toHaveBeenCalledWith(
      expect.stringContaining(`${path.sep}apis.json`)
    )
  })
})
