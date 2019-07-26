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
const fs = require(`fs-extra`)
const axios = require(`axios`)
const getLatestAPIs = require(`../get-latest-apis`)

beforeEach(() => {
  ;[fs, axios].forEach(mock =>
    Object.keys(mock).forEach(key => mock[key].mockClear())
  )
})

const getMockAPIFile = () => {
  return {
    node: {},
    browser: {},
    ssr: {},
  }
}

it(`defaults to cached file, if it exists`, async () => {
  const apis = getMockAPIFile()
  fs.exists.mockResolvedValueOnce(true)
  fs.readJSON.mockResolvedValueOnce(apis)

  const data = await getLatestAPIs()

  expect(fs.writeFile).not.toHaveBeenCalled()
  expect(data).toEqual(apis)
})

describe(`API file not cached`, () => {
  beforeEach(() => {
    fs.exists.mockResolvedValueOnce(false)
    axios.get.mockResolvedValueOnce({ data: getMockAPIFile() })
  })

  it(`makes a request to unpkg to request file`, async () => {
    const data = await getLatestAPIs()

    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining(`unpkg.com`))
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
