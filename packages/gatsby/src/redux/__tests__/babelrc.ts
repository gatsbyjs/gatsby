import { actions } from "../actions"
import { babelrcReducer } from "../reducers/babelrc"
import {
  prepareOptions,
  mergeConfigItemOptions,
  addRequiredPresetOptions,
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
    const babel = { createConfigItem: jest.fn() } as any

    prepareOptions(babel, { stage: `test` as any }, fakeResolver as any)

    expect(babel.createConfigItem.mock.calls).toMatchSnapshot()
  })

  it(`adds stage option to babel-preset-gatsby defined with userland babelrc`, () => {
    const fakeResolver = (moduleName): string => `/path/to/module/${moduleName}`
    const babel = { createConfigItem: jest.fn() }
    const presets: any = [
      {
        file: { resolved: fakeResolver(`babel-preset-gatsby`) },
      },
    ]

    addRequiredPresetOptions(babel, presets, { stage: `develop` }, fakeResolver)

    expect(babel.createConfigItem.mock.calls).toMatchSnapshot()
  })

  it(`allows setting options`, () => {
    const action = actions.setBabelOptions(
      { options: { sourceMaps: `inline` } },
      { name: `test` }
    )
    let state = babelrcReducer(undefined, action)
    expect(state.stages.develop.options!.sourceMaps).toBe(`inline`)

    const updateAction = actions.setBabelOptions(
      { options: { sourceMaps: true } },
      { name: `test` }
    )
    state = babelrcReducer(state, updateAction)

    expect(state.stages.develop.options!.sourceMaps).toBe(true)
  })

  it(`allows setting options on a particular stage`, () => {
    const action = actions.setBabelOptions(
      { options: { sourceMaps: `inline` }, stage: `develop` },
      { name: `test` }
    )
    const state = babelrcReducer(undefined, action)
    expect(state.stages.develop.options!.sourceMaps).toBe(`inline`)
    expect(state.stages[`develop-html`].options!.sourceMaps).toBe(undefined)
  })

  it(`allows merging config items`, () => {
    const babel = { createConfigItem: jest.fn() } as any
    // This merges in new change.
    mergeConfigItemOptions({
      items: [
        {
          value: (): null => null,
          dirname: `hi`,
          options: { wat: 1 },
          file: { resolved: `hi`, request: `hello` },
        },
      ],
      itemToMerge: {
        value: (): null => null,
        dirname: `hi`,
        options: { wat: 2 },
        file: { resolved: `hi`, request: `hello` },
      },
      type: `plugin`,
      babel,
    })
    expect(babel.createConfigItem.mock.calls).toMatchSnapshot()

    expect(
      mergeConfigItemOptions({
        items: [
          {
            value: (): null => null,
            dirname: `hi`,
            options: { wat: 1 },
            file: { resolved: `hi`, request: `hello` },
          },
        ],
        itemToMerge: {
          value: (): null => null,
          dirname: `hi2`,
          options: { wat: 2 },
          file: { resolved: `hi2`, request: `hello2` },
        },
        type: `plugin`,
        babel,
      })
    ).toMatchSnapshot()
  })
})
