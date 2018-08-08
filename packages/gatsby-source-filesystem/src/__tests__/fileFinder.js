const fileFinder = require(`../file-finder`)

describe(`file-finder`, () => {
  it(`resolves an array of file paths`, async done => {
    expect.assertions(3)
    const queue = await fileFinder(`${__dirname}/fixtures/test-fs`)
    const expectedQueue = [
      `${__dirname}/fixtures/test-fs/index.md`,
      `${__dirname}/fixtures/test-fs/dirA/index.md`,
      `${__dirname}/fixtures/test-fs/dirB/index.md`,
      `${__dirname}/fixtures/test-fs/dirA/a/index.md`,
      `${__dirname}/fixtures/test-fs/dirA/a/A/index.md`,
      `${__dirname}/fixtures/test-fs/dirA/b/index.md`,
      `${__dirname}/fixtures/test-fs/dirA/b/A/index.md`,
      `${__dirname}/fixtures/test-fs/dirA/c/index.md`,
      `${__dirname}/fixtures/test-fs/dirA/c/A/index.md`,
    ]

    expect(queue.length).toBeGreaterThan(0)
    expect(queue.length).toEqual(expectedQueue.length)
    const hasAllFiles = expectedQueue.every(expected =>
      queue.some(item => item === expected)
    )
    expect(hasAllFiles).toBe(true)
    done()
  })
})
