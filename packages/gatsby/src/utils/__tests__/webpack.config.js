jest.mock(`../api-runner-node`, () => jest.fn())
jest.mock(`../../redux`, () => {
  return {
    dispatch: jest.fn(),
    extensions: [],
  }
})
const webpackConfig = require(`../webpack.config`)

const getConfig = (args = {}) =>
  webpackConfig(
    {
      extensions: [`.js`],
    },
    process.cwd(),
    `build-html`
  )

describe(`basic functionality`, () => {
  it(`returns webpack config`, async () => {
    const config = await getConfig()

    console.log(config)
  })
})
