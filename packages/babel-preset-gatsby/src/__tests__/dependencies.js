const preset = require(`../dependencies`)

describe(`dependencies`, () => {
  it(`should specify proper presets and plugins`, () => {
    expect(preset()).toMatchSnapshot()
  })
})
