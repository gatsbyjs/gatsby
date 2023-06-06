import path from "path"
import { formatLogMessage } from "~/utils/format-log-message"
import isInteger from "lodash/isInteger"
import { IPluginOptions } from "~/models/gatsby-api"
import { GatsbyNodeApiHelpers } from "~/utils/gatsby-types"
import { usingGatsbyV4OrGreater } from "~/utils/gatsby-version"
import { cloneDeep } from "lodash"

interface IProcessorOptions {
  userPluginOptions: IPluginOptions
  helpers: GatsbyNodeApiHelpers
}

interface IOptionsProcessor {
  name: string
  test: (options: IProcessorOptions) => boolean
  processor: (options: IProcessorOptions) => IPluginOptions | void
}

let warnedAboutMediaItemLazyNodes = false

const optionsProcessors: Array<IOptionsProcessor> = [
  {
    name: `MediaItem.lazyNodes doesn't work in Gatsby v4+`,
    test: ({ userPluginOptions }): boolean =>
      userPluginOptions?.type?.MediaItem?.lazyNodes,
    processor: ({ helpers, userPluginOptions }): IPluginOptions => {
      if (usingGatsbyV4OrGreater) {
        helpers.reporter.panic(
          formatLogMessage(
            `The type.MediaItem.lazyNodes option isn't supported in Gatsby v4+ due to query running using JS workers in PQR (Parallell Query Running). lazyNodes creates nodes in GraphQL resolvers and PQR doesn't support that.\n\nIf you would like to prevent gatsby-source-wordpress from fetching File nodes for each MediaItem node, set the type.MediaItem.createFileNodes option to false.`
          )
        )
      } else if (!warnedAboutMediaItemLazyNodes) {
        warnedAboutMediaItemLazyNodes = true
        helpers.reporter.warn(
          formatLogMessage(
            `\nThe type.MediaItem.lazyNodes option wont be supported in Gatsby v4+ due to query running using JS workers in PQR (Parallell Query Running). lazyNodes creates nodes in GraphQL resolvers and PQR doesn't support that.\n\nThis option works with your current version of Gatsby but will stop working in Gatsby v4+.\n\nIf you would like to prevent gatsby-source-wordpress from fetching File nodes for each MediaItem node, set the type.MediaItem.createFileNodes option to false instead.\n`
          )
        )
      }

      return userPluginOptions
    },
  },
  {
    name: `pluginOptions.type.MediaItem.limit is not allowed`,
    test: ({ userPluginOptions }): boolean =>
      !!userPluginOptions?.type?.MediaItem?.limit,
    processor: ({ helpers, userPluginOptions }): void => {
      helpers.reporter.panic(
        formatLogMessage(
          `PluginOptions.type.MediaItem.limit is an disallowed plugin option.\nPlease remove the MediaItem.limit option from gatsby-config.js (currently set to ${userPluginOptions?.type?.MediaItem?.limit})\n\nMediaItem nodes are automatically limited to 0 and then fetched only when referenced by other node types. For example as a featured image, in custom fields, or in post_content.`
        )
      )
    },
  },
  {
    name: `queryDepth-is-not-a-positive-int`,
    test: ({ userPluginOptions }: IProcessorOptions): boolean =>
      typeof userPluginOptions?.schema?.queryDepth !== `undefined` &&
      (!isInteger(userPluginOptions?.schema?.queryDepth) ||
        userPluginOptions?.schema?.queryDepth <= 0),
    processor: ({
      helpers,
      userPluginOptions,
    }: IProcessorOptions): IPluginOptions => {
      helpers.reporter.log(``)
      helpers.reporter.warn(
        formatLogMessage(
          `\n\npluginOptions.schema.queryDepth is not a positive integer.\nUsing default value in place of provided value.\n`,
          { useVerboseStyle: true }
        )
      )

      delete userPluginOptions.schema.queryDepth

      return userPluginOptions
    },
  },
  {
    name: `Require beforeChangeNode type setting functions by absolute or relative path`,
    test: ({ userPluginOptions }: IProcessorOptions): boolean =>
      !!userPluginOptions?.type,
    processor: ({
      helpers,
      userPluginOptions,
    }: IProcessorOptions): IPluginOptions => {
      // This is the Gatsby store, so we don't access it as getStore()
      const gatsbyStore = helpers.store.getState()
      const typeSettings = Object.entries(userPluginOptions.type)

      typeSettings.forEach(([typeName, settings]) => {
        const beforeChangeNodePath = settings?.beforeChangeNode

        if (
          usingGatsbyV4OrGreater &&
          typeof beforeChangeNodePath === `function`
        ) {
          helpers.reporter.panic(
            `Since Gatsby v4+ you cannot use the ${typeName}.beforeChangeNode option as a function. Please make the option a relative or absolute path to a JS file where the beforeChangeNode fn is the default export.`
          )
        }

        if (!beforeChangeNodePath || typeof beforeChangeNodePath !== `string`) {
          return
        }

        try {
          const absoluteRequirePath: string | undefined = path.isAbsolute(
            beforeChangeNodePath
          )
            ? beforeChangeNodePath
            : require.resolve(
                path.join(gatsbyStore.program.directory, beforeChangeNodePath)
              )

          const beforeChangeNodeFn = require(absoluteRequirePath)

          if (beforeChangeNodeFn) {
            userPluginOptions.type[typeName].beforeChangeNode =
              beforeChangeNodeFn
          }
        } catch (e) {
          helpers.reporter.panic(
            formatLogMessage(
              `beforeChangeNode type setting for ${typeName} threw error:\n${e.message}`
            )
          )
        }
      })

      return userPluginOptions
    },
  },
]

export const processAndValidatePluginOptions = (
  helpers: GatsbyNodeApiHelpers,
  pluginOptions: IPluginOptions
): IPluginOptions => {
  let userPluginOptions = cloneDeep(pluginOptions)

  optionsProcessors.forEach(({ test, processor, name }) => {
    if (!name) {
      helpers.reporter.panic(
        formatLogMessage(
          `Plugin option filter is unnamed\n\n${test.toString()}\n\n${processor.toString()}`
        )
      )
    }

    if (test({ helpers, userPluginOptions })) {
      const filteredUserPluginOptions = processor({
        helpers,
        userPluginOptions,
      })

      if (filteredUserPluginOptions) {
        userPluginOptions = filteredUserPluginOptions
      } else {
        helpers.reporter.panic(
          formatLogMessage(
            `Plugin option filter ${name} didn't return a filtered options object`
          )
        )
      }
    }
  })

  return userPluginOptions
}
