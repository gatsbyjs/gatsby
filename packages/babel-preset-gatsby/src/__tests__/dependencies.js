const preset = require(`../dependencies`)

const noopResolve = m => `<node_modules>/${m}/index.js`

describe(`dependencies`, () => {
  it(`should specify proper presets and plugins`, () => {
    expect(preset(undefined, undefined, noopResolve)).toMatchSnapshot()
  })
})
