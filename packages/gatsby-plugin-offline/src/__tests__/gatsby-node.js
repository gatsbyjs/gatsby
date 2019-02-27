const { onPreInit } = require(`../gatsby-node`)

const getOptions = config => {
  return {
    reporter: {
      stripIndent: jest.fn(str => str.trim()),
    },
    store: {
      getState() {
        return {
          config,
        }
      },
    },
  }
}

test(`it throws error if assetPrefix is in config`, () => {
  expect(() =>
    onPreInit(
      getOptions({
        assetPrefix: `https://cdn.example.com`,
      })
    )
  ).toThrowErrorMatchingSnapshot()
})

test(`it does not throw if assetPrefix is not in config`, () => {
  expect(() =>
    onPreInit(
      getOptions({
        pathPrefix: `/blog`,
      })
    )
  ).not.toThrow()
})
