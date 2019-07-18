const preset = require(`../dependencies`)

describe(`dependencies`, () => {
  it(`should specify proper presets and plugins when stage is %s`, () => {
    expect(preset()).toMatchSnapshot()
  })
})
