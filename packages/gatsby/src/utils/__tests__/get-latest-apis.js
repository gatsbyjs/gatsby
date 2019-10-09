jest.mock(`fs-extra`, () => {
  return {
    exists: jest.fn(),
    readJSON: jest.fn(),
    writeFile: jest.fn(),
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
const getLatestAPIs = require(`../get-latest-apis`)

beforeEach(() => {
  ;[fs, axios].forEach(mock =>
    Object.keys(mock).forEach(key => mock[key].mockReset())
  )
})

const getMockAPIFile = () => {
  return {
    node: {},
    browser: {},
    ssr: {},
  }
}

describe(`default behavior: has network connectivity`, () => {
  beforeEach(() => {
    fs.exists.mockResolvedValueOnce(false)
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

  it(`writes api file`, async () => {
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
    fs.exists.mockResolvedValueOnce(true)
    fs.readJSON.mockResolvedValueOnce(apis)

    const data = await getLatestAPIs()

    expect(fs.writeFile).not.toHaveBeenCalled()
    expect(fs.readJSON).toHaveBeenCalledWith(
      expect.stringContaining(`${path.sep}latest-apis.json`)
    )
    expect(data).toEqual(apis)
  })

  it(`falls back to local api.json if latest-apis.json not cached`, async () => {
    const apis = getMockAPIFile()
    fs.exists.mockResolvedValueOnce(false)
    fs.readJSON.mockResolvedValueOnce(apis)

    await getLatestAPIs()

    expect(fs.readJSON).toHaveBeenCalledWith(
      expect.stringContaining(`${path.sep}apis.json`)
    )
  })
})
