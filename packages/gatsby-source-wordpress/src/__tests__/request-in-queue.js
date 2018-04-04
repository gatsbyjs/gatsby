jest.mock(`axios`)

const requestInQueue = require(`../request-in-queue`)
const axios = require(`axios`)

axios.mockImplementation(opts => {
  if (opts.throw) {
    throw new Error(opts.throw)
  }

  return opts.url.slice(opts.url.lastIndexOf(`/`) + 1)
})

describe(`requestInQueue`, () => {
  let requests

  beforeEach(() => {
    requests = [
      { method: `get`, url: `https://gatsbyjs.org/1` },
      { method: `get`, url: `https://gatsbyjs.org/2` },
      { method: `get`, url: `https://gatsbyjs.org/3` },
      { method: `get`, url: `https://gatsbyjs.org/4` },
    ]
  })

  afterEach(() => {
    axios.mockClear()
  })

  it(`runs all requests in queue`, async () => {
    await requestInQueue(requests)

    requests.forEach(req => {
      expect(axios).toHaveBeenCalledWith(req)
    })
  })

  it(`returns the values in the same order they were requested`, async () => {
    const responses = await requestInQueue(requests)
    expect(responses).toEqual([`1`, `2`, `3`, `4`])
  })

  it(`stops any requests when one throws an error`, async () => {
    try {
      await requestInQueue([{ throw: `error` }, ...requests])
    } catch (err) {
      expect(err).toBeDefined()
    }
    expect(axios).toHaveBeenCalledTimes(1)
  })
})
