const preset = require(`../dependencies`)

expect.addSnapshotSerializer(require(`../utils/path-serializer`))

describe(`dependencies`, () => {
  it(`should specify proper presets and plugins`, () => {
    expect(preset()).toMatchSnapshot()
  })
})
