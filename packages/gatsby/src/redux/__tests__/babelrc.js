const fs = require(`fs-extra`)
const path = require(`path`)
const json5 = require(`json5`)

const { actions } = require(`../actions`)
const babelrcReducer = require(`../reducers/babelrc`)
const {
  addDefaultPluginsPresets,
  actionifyBabelrc,
} = require(`../../internal-plugins/load-babel-config/gatsby-node`)
const { buildConfig } = require(`../../utils/babel-config`)

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
    const actionsLog = []
    const mockActions = {
      setBabelPreset: args => {
        actionsLog.push(actions.setBabelPreset(args, { name: `test` }))
      },
      setBabelPlugin: args => {
        actionsLog.push(actions.setBabelPlugin(args, { name: `test` }))
      },
    }
    addDefaultPluginsPresets(mockActions, {
      stage: `develop`,
      browserslist: {},
    })
    addDefaultPluginsPresets(mockActions, {
      stage: `build-html`,
      browserslist: {},
    })
    const endState = actionsLog.reduce(
      (state, action) => babelrcReducer(state, action),
      undefined
    )
    expect(endState).toMatchSnapshot()
    expect(buildConfig(endState.stages.develop, `develop`)).toMatchSnapshot()
    expect(buildConfig(endState.stages.develop, `build-html`)).toMatchSnapshot()
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
    let state = babelrcReducer(undefined, action)
    expect(state.stages.develop.options.sourceMaps).toBe(`inline`)
    expect(state.stages[`develop-html`].options.sourceMaps).toBe(undefined)
  })

  it(`handles custom .babelrc files`, async () => {
    const file = await fs.readFile(
      path.join(__dirname, `mocks`, `.babelrc`),
      `utf-8`
    )
    const parsed = json5.parse(file)

    const actionsLog = []
    const mockActions = {
      setBabelPreset: args => {
        actionsLog.push(actions.setBabelPreset(args, { name: `test` }))
      },
      setBabelPlugin: args => {
        actionsLog.push(actions.setBabelPlugin(args, { name: `test` }))
      },
      setBabelOptions: args => {
        actionsLog.push(actions.setBabelOptions(args, { name: `test` }))
      },
    }
    actionifyBabelrc(parsed, mockActions)
    const endState = actionsLog.reduce(
      (state, action) => babelrcReducer(state, action),
      undefined
    )

    expect(endState).toMatchSnapshot()
  })
})
