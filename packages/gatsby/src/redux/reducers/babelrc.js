const _ = require(`lodash`)

module.exports = (
  state = {
    stages: {
      develop: {
        plugins: [],
        presets: [],
        options: {
          cacheDirectory: true,
          babelrc: false,
        },
      },
      "develop-html": {
        plugins: [],
        presets: [],
        options: {
          cacheDirectory: true,
          babelrc: false,
        },
      },
      "build-html": {
        plugins: [],
        presets: [],
        options: {
          cacheDirectory: true,
          babelrc: false,
        },
      },
      "build-javascript": {
        plugins: [],
        presets: [],
        options: {
          cacheDirectory: true,
          babelrc: false,
        },
      },
    },
  },
  action
) => {
  switch (action.type) {
    case `SET_BABEL_PLUGIN`: {
      Object.keys(state.stages).forEach(stage => {
        if (action.payload.stage && action.payload.stage !== stage) {
          return
        }

        const index = _.findIndex(
          state.stages[stage].plugins,
          p => p.name === action.payload.name
        )
        // If the plugin already exists, merge the options.
        // Otherwise, add it to the end.
        if (index !== -1) {
          const plugin = state.stages[stage].plugins[index]
          state.stages[stage].plugins[index] = {
            name: plugin.name,
            options: _.merge(plugin.options, action.payload.options),
          }
        } else {
          state.stages[stage].plugins = [
            ...state.stages[stage].plugins,
            action.payload,
          ]
        }
      })

      return state
    }
    case `SET_BABEL_PRESET`: {
      Object.keys(state.stages).forEach(stage => {
        if (action.payload.stage && action.payload.stage !== stage) {
          return
        }

        const index = _.findIndex(
          state.stages[stage].presets,
          p => p.name === action.payload.name
        )
        // If the plugin already exists, merge the options.
        // Otherwise, add it to the end.
        if (index !== -1) {
          const plugin = state.stages[stage].presets[index]
          state.stages[stage].presets[index] = {
            name: plugin.name,
            options: _.merge(plugin.options, action.payload.options),
          }
        } else {
          state.stages[stage].presets = [
            ...state.stages[stage].presets,
            action.payload,
          ]
        }
      })
      return state
    }
    case `SET_BABEL_OPTIONS`: {
      Object.keys(state.stages).forEach(stage => {
        if (action.payload.stage && action.payload.stage !== stage) {
          return
        }

        state.stages[stage].options = {
          ...state.stages[stage].options,
          ...action.payload.options,
        }
      })
      return state
    }
  }

  return state
}
