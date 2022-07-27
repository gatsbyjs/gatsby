import { actions } from "../actions"
import { babelrcReducer } from "../reducers/babelrc"
import {
  prepareOptions,
  mergeConfigItemOptions,
  convertCustomPresetsToPlugins,
} from "../../utils/babel-loader-helpers"

describe(`Babelrc actions/reducer`, () => {
  it(`allows adding a new plugin`, () => {
    const action = actions.setBabelPlugin(
      { name: `test-babel-plugin` },
      { name: `test` }
    )
    expect(babelrcReducer(undefined, action)).toMatchSnapshot()
  })

  it(`allows updating the options of an existing plugin`, () => {
    const action = actions.setBabelPlugin(
      { name: `test-babel-plugin`, options: { id: 1 } },
      { name: `test` }
    )
    let state = babelrcReducer(undefined, action)
    expect(state.stages.develop.plugins[0].options.id).toBe(1)

    const updateAction = actions.setBabelPlugin(
      { name: `test-babel-plugin`, options: { id: 2 } },
      { name: `test` }
    )
    state = babelrcReducer(state, updateAction)
    expect(state.stages.develop.plugins[0].options.id).toBe(2)
  })

  it(`allows adding a new preset`, () => {
    const action = actions.setBabelPreset(
      { name: `test-babel-preset` },
      { name: `test` }
    )
    expect(babelrcReducer(undefined, action)).toMatchSnapshot()
  })

  it(`allows updating the options of an existing preset`, () => {
    const action = actions.setBabelPreset(
      { name: `test-babel-preset`, options: { id: 1 } },
      { name: `test` }
    )
    let state = babelrcReducer(undefined, action)
    expect(state.stages.develop.presets[0].options.id).toBe(1)

    const updateAction = actions.setBabelPreset(
      { name: `test-babel-preset`, options: { id: 2 } },
      { name: `test` }
    )
    state = babelrcReducer(state, updateAction)
    expect(state.stages.develop.presets[0].options.id).toBe(2)
  })

  it(`allows specifying the stage for the plugin`, () => {
    const action = actions.setBabelPlugin(
      { name: `test-babel-plugin`, stage: `build-javascript` },
      { name: `test` }
    )
    const state = babelrcReducer(undefined, action)
    expect(state.stages.develop.plugins.length).toBe(0)
    expect(state.stages[`build-javascript`].plugins.length).toBe(1)
  })

  it(`allows specifying the stage for the preset`, () => {
    const action = actions.setBabelPreset(
      { name: `test-babel-preset`, stage: `build-javascript` },
      { name: `test` }
    )
    const state = babelrcReducer(undefined, action)
    expect(state.stages.develop.presets.length).toBe(0)
    expect(state.stages[`build-javascript`].presets.length).toBe(1)
  })

  it(`sets default presets/plugins if there's no userland babelrc`, () => {
    const fakeResolver = (moduleName): string => `/path/to/module/${moduleName}`
    const babel = { createConfigItem: jest.fn() }

    prepareOptions(babel, { stage: `test` }, fakeResolver)

    expect(babel.createConfigItem.mock.calls).toMatchSnapshot()
  })

  it(`adds stage option to babel-preset-gatsby defined with userland babelrc`, () => {
    const fakeResolver = (moduleName): string => `/path/to/module/${moduleName}`

    const BabelPresetGatsbyConfigItem = {
      file: { resolved: fakeResolver(`babel-preset-gatsby`) },
    }

    const babel = {
      createConfigItem: jest.fn((presetDescriptor: any): any => {
        if (!Array.isArray(presetDescriptor)) {
          presetDescriptor = [presetDescriptor]
        }

        const name = presetDescriptor[0]
        if (name.includes(`babel-preset-gatsby`)) {
          return {
            ...BabelPresetGatsbyConfigItem,
            options: presetDescriptor[1],
          }
        }
        return undefined
      }),
    }
    const presets: any = [BabelPresetGatsbyConfigItem]

    const { presets: convertedPresets } = convertCustomPresetsToPlugins(
      babel,
      { presets, plugins: [] },
      { stage: `develop` },
      fakeResolver
    )

    const babelPresetGatsbyPreset = convertedPresets.find(preset =>
      preset?.file?.resolved?.includes(`babel-preset-gatsby`)
    )

    expect(babelPresetGatsbyPreset?.options).toMatchInlineSnapshot(`
      Object {
        "stage": "develop",
      }
    `)
  })

  it(`adds stage option to babel-preset-gatsby defined in nested preset`, () => {
    const fakeResolver = (moduleName): string => `/path/to/module/${moduleName}`

    const BabelPresetGatsbyConfigItem = {
      file: { resolved: fakeResolver(`babel-preset-gatsby`) },
    }

    const CustomPresetGatsbyConfigItem = {
      file: { resolved: fakeResolver(`custome-preset`) },
      value: (): any => {
        return {
          presets: [`babel-preset-gatsby`],
          plugins: [[`babel-plugin-testing-stuff`, { foo: `bar` }]],
        }
      },
    }

    const babel = {
      createConfigItem: jest.fn((presetDescriptor: any): any => {
        if (!Array.isArray(presetDescriptor)) {
          presetDescriptor = [presetDescriptor]
        }

        const name = presetDescriptor[0]
        if (name.includes(`babel-preset-gatsby`)) {
          return {
            ...BabelPresetGatsbyConfigItem,
            options: presetDescriptor[1],
          }
        }

        if (name.includes(`babel-plugin-testing-stuff`)) {
          return {
            options: presetDescriptor[1],
            file: { resolved: fakeResolver(`babel-plugin-testing-stuff`) },
          }
        }

        return undefined
      }),
    }
    const presets: any = [CustomPresetGatsbyConfigItem]

    const { presets: convertedPresets, plugins: convertedPlugins } =
      convertCustomPresetsToPlugins(
        babel,
        { presets, plugins: [] },
        { stage: `develop` },
        fakeResolver
      )

    const babelPresetGatsbyPreset = convertedPresets.find(preset =>
      preset?.file?.resolved?.includes(`babel-preset-gatsby`)
    )

    expect(babelPresetGatsbyPreset?.options).toMatchInlineSnapshot(`
      Object {
        "stage": "develop",
      }
    `)

    // make sure we preserve options for plugins from the custom preset
    const pluginFromCustomPreset = convertedPlugins.find(plugin =>
      plugin?.file?.resolved?.includes(`babel-plugin-testing-stuff`)
    )
    expect(pluginFromCustomPreset?.options).toMatchInlineSnapshot(`
      Object {
        "foo": "bar",
      }
    `)
  })

  it(`allows setting options`, () => {
    const action = actions.setBabelOptions(
      { options: { sourceMaps: `inline` } },
      { name: `test` }
    )
    let state = babelrcReducer(undefined, action)
    expect(state.stages.develop.options.sourceMaps).toBe(`inline`)

    const updateAction = actions.setBabelOptions(
      { options: { sourceMaps: true } },
      { name: `test` }
    )
    state = babelrcReducer(state, updateAction)

    expect(state.stages.develop.options.sourceMaps).toBe(true)
  })

  it(`allows setting options on a particular stage`, () => {
    const action = actions.setBabelOptions(
      { options: { sourceMaps: `inline` }, stage: `develop` },
      { name: `test` }
    )
    const state = babelrcReducer(undefined, action)
    expect(state.stages.develop.options.sourceMaps).toBe(`inline`)
    expect(state.stages[`develop-html`].options.sourceMaps).toBe(undefined)
  })

  it(`allows merging config items`, () => {
    const babel = { createConfigItem: jest.fn() }
    // This merges in new change.
    mergeConfigItemOptions({
      items: [{ options: { wat: 1 }, file: { resolved: `hi` } }],
      itemToMerge: { options: { wat: 2 }, file: { resolved: `hi` } },
      type: `plugin`,
      babel,
    })
    expect(babel.createConfigItem.mock.calls).toMatchSnapshot()

    expect(
      mergeConfigItemOptions({
        items: [{ options: { wat: 1 }, file: { resolved: `hi` } }],
        itemToMerge: { options: { wat: 2 }, file: { resolved: `hi2` } },
        type: `plugin`,
        babel,
      })
    ).toMatchSnapshot()
  })
})
