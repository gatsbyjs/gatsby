import store from "../../../dist/store"

test(`Plugin options presets merge preset data into default and user data`, () => {
  store.dispatch.gatsbyApi.setState({
    pluginOptions: {
      url: `test.com`,
      type: {
        ExistingType: {
          limit: 3,
        },
        FakeType: {
          exclude: true,
        },
      },
      presets: [
        {
          presetName: `TEST_PRESET`,
          useIf: () => true,
          options: {
            type: {
              FakeType: {
                exclude: false,
                limit: 1,
              },
              ExistingType: {
                limit: 2,
              },
            },
          },
        },
      ],
    },
    helpers: null,
  })

  const { pluginOptions } = store.getState().gatsbyApi

  // our top level options override preset options
  expect(pluginOptions.type.ExistingType.limit).toBe(3)
  expect(pluginOptions.type.FakeType.exclude).toBe(true)

  // this option wasn't defined at the top level but is part of the preset
  expect(pluginOptions.type.FakeType.limit).toBe(1)
})
