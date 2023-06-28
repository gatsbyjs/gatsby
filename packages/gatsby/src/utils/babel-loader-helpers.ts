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

/**
 * https://babeljs.io/docs/en/babel-core#createconfigitem
 * If this function is called multiple times for a given plugin,
 * Babel will call the plugin's function itself multiple times.
 * If you have a clear set of expected plugins and presets to inject,
 * pre-constructing the config items would be recommended.
 */
const configItemsMemoCache = new Map()

export interface ICustomOptions extends Record<string, unknown> {
  stage: Stage
  resourceQuery: string
}

export const prepareOptions = (
  babel: typeof Babel,
  customOptions: ICustomOptions,
  resolve: RequireResolve = require.resolve
): Array<Array<PluginItem>> => {
  const {
    stage,
    reactRuntime,
    reactImportSource,
    isPageTemplate,
    resourceQuery,
  } = customOptions

  const configItemsMemoCacheKey = `${stage}-${isPageTemplate}-${resourceQuery}`

  if (configItemsMemoCache.has(configItemsMemoCacheKey)) {
    return configItemsMemoCache.get(configItemsMemoCacheKey)
  }

  const pluginBabelConfig = loadCachedConfig()

  // Required plugins/presets
  const requiredPlugins = [
    babel.createConfigItem(
      [
        resolve(`babel-plugin-remove-graphql-queries`),
        // packages/babel-plugin-remove-graphql-queries/src/index.ts sets a default value for staticQueryDir
        // They should be identical
        { stage, staticQueryDir: `page-data/sq/d` },
      ],
      {
        type: `plugin`,
      }
    ),
  ]

  if ((stage === `develop` || stage === `build-javascript`) && isPageTemplate) {
    const apis = [`getServerData`, `config`]

    if (
      resourceQuery.includes(`?export=default`) ||
      resourceQuery.includes(`&export=default`)
    ) {
      apis.push(`Head`)
    }

    if (
      resourceQuery.includes(`?export=head`) ||
      resourceQuery.includes(`&export=head`)
    ) {
      apis.push(`default`)
    }

    requiredPlugins.push(
      babel.createConfigItem(
        [
          resolve(`./babel/babel-plugin-remove-api`),
          {
            apis,
          },
        ],
        {
          type: `plugin`,
        }
      )
    )
  }

  if (
    stage === `develop` ||
    stage === `build-html` ||
    stage === `develop-html`
  ) {
    requiredPlugins.push(
      babel.createConfigItem(
        [resolve(`./babel/babel-plugin-add-slice-placeholder-location`)],
        {
          type: `plugin`,
        }
      )
    )
  }

  const requiredPresets: Array<PluginItem> = []

  if (stage === `develop`) {
    requiredPlugins.push(
      babel.createConfigItem([resolve(`react-refresh/babel`)], {
        type: `plugin`,
      })
    )
  }

  // Fallback preset
  const fallbackPresets: Array<ConfigItem> = []

  fallbackPresets.push(
    babel.createConfigItem(
      [
        resolve(`babel-preset-gatsby`),
        {
          stage,
          reactRuntime,
          reactImportSource,
        },
      ],
      {
        type: `preset`,
      }
    )
  )

  // Go through babel state and create config items for presets/plugins from.
  const reduxPlugins: Array<PluginItem> = []
  const reduxPresets: Array<PluginItem> = []

  if (stage) {
    pluginBabelConfig.stages[stage].plugins.forEach(plugin => {
      reduxPlugins.push(
        babel.createConfigItem([resolve(plugin.name), plugin.options], {
          dirname: plugin.name,
          type: `plugin`,
        })
      )
    })
    pluginBabelConfig.stages[stage].presets.forEach(preset => {
      reduxPresets.push(
        babel.createConfigItem([resolve(preset.name), preset.options], {
          dirname: preset.name,
          type: `preset`,
        })
      )
    })
  }

  const toReturn = [
    reduxPresets,
    reduxPlugins,
    requiredPresets,
    requiredPlugins,
    fallbackPresets,
  ]

  configItemsMemoCache.set(configItemsMemoCacheKey, toReturn)

  return toReturn
}

export const addRequiredPresetOptions = (
  babel: typeof Babel,
  presets: Array<ConfigItem>,
  options: { stage?: Stage } = {},
  resolve: RequireResolve = require.resolve
): Array<PluginItem> => {
  // Always pass `stage` option to babel-preset-gatsby
  //  (even if defined in custom babelrc)
  const gatsbyPresetResolved = resolve(`babel-preset-gatsby`)
  const index = presets.findIndex(
    p => p.file!.resolved === gatsbyPresetResolved
  )

  if (index !== -1) {
    presets[index] = babel.createConfigItem(
      [
        gatsbyPresetResolved,
        { ...presets[index].options, stage: options.stage },
      ],
      { type: `preset` }
    )
  }
  return presets
}

export const mergeConfigItemOptions = ({
  items,
  itemToMerge,
  type,
  babel,
}: {
  items: Array<ConfigItem>
  itemToMerge: ConfigItem
  type: CreateConfigItemOptions["type"]
  babel: typeof Babel
}): Array<ConfigItem> => {
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
