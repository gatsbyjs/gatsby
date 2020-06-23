import path from "path"
import _ from "lodash"
import Babel, {
  ConfigItem,
  PluginItem,
  CreateConfigItemOptions,
} from "@babel/core"

import { IBabelStage } from "../redux/types"
import { Stage } from "../commands/types"

interface ILoadCachedConfigReturnType {
  stages: {
    test: IBabelStage
  }
}

const loadCachedConfig = (): ILoadCachedConfigReturnType => {
  let pluginBabelConfig = {
    stages: {
      test: { plugins: [], presets: [] },
    },
  }
  if (process.env.NODE_ENV !== `test`) {
    pluginBabelConfig = require(path.join(
      process.cwd(),
      `./.cache/babelState.json`
    ))
  }
  return pluginBabelConfig
}

export const getCustomOptions = (stage: Stage): IBabelStage["options"] => {
  const pluginBabelConfig = loadCachedConfig()
  return pluginBabelConfig.stages[stage].options
}

export const prepareOptions = (
  babel: typeof Babel,
  options: { stage?: Stage } = {},
  resolve: RequireResolve = require.resolve
): Array<PluginItem[]> => {
  const pluginBabelConfig = loadCachedConfig()

  const { stage } = options

  // Required plugins/presets
  const requiredPlugins = [
    babel.createConfigItem([resolve(`babel-plugin-remove-graphql-queries`)], {
      type: `plugin`,
    }),
  ]
  const requiredPresets: PluginItem[] = []

  // Stage specific plugins to add
  if (stage === `build-html` || stage === `develop-html`) {
    requiredPlugins.push(
      babel.createConfigItem([resolve(`babel-plugin-dynamic-import-node`)], {
        type: `plugin`,
      })
    )
  }

  // TODO: Remove entire block when we make fast-refresh the default
  if (stage === `develop` && process.env.GATSBY_HOT_LOADER !== `fast-refresh`) {
    requiredPlugins.push(
      babel.createConfigItem([resolve(`react-hot-loader/babel`)], {
        type: `plugin`,
      })
    )
  }

  // Fallback preset
  const fallbackPresets: ConfigItem[] = []

  fallbackPresets.push(
    babel.createConfigItem(
      [
        resolve(`babel-preset-gatsby`),
        {
          stage,
        },
      ],
      {
        type: `preset`,
      }
    )
  )

  // Go through babel state and create config items for presets/plugins from.
  const reduxPlugins: PluginItem[] = []
  const reduxPresets: PluginItem[] = []

  if (stage) {
    pluginBabelConfig.stages[stage].plugins.forEach(plugin => {
      reduxPlugins.push(
        babel.createConfigItem([resolve(plugin.name), plugin.options], {
          name: plugin.name,
          type: `plugin`,
        })
      )
    })
    pluginBabelConfig.stages[stage].presets.forEach(preset => {
      reduxPresets.push(
        babel.createConfigItem([resolve(preset.name), preset.options], {
          name: preset.name,
          type: `preset`,
        })
      )
    })
  }

  return [
    reduxPresets,
    reduxPlugins,
    requiredPresets,
    requiredPlugins,
    fallbackPresets,
  ]
}

export const mergeConfigItemOptions = ({
  items,
  itemToMerge,
  type,
  babel,
}: {
  items: ConfigItem[]
  itemToMerge: ConfigItem
  type: CreateConfigItemOptions["type"]
  babel: typeof Babel
}): ConfigItem[] => {
  const index = _.findIndex(
    items,
    i => i.file?.resolved === itemToMerge.file?.resolved
  )

  // If this exist, merge the options, otherwise, add it to the array
  if (index !== -1) {
    items[index] = babel.createConfigItem(
      [
        itemToMerge.file?.resolved,
        _.merge({}, items[index].options, itemToMerge.options),
      ],
      {
        type,
      }
    )
  } else {
    items.push(itemToMerge)
  }

  return items
}
