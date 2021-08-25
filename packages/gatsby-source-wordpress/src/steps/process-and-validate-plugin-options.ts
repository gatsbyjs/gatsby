import path from "path"
import { formatLogMessage } from "~/utils/format-log-message"
import isInteger from "lodash/isInteger"
import { IPluginOptions } from "~/models/gatsby-api"
import { GatsbyNodeApiHelpers } from "~/utils/gatsby-types"
interface IProcessorOptions {
  userPluginOptions: IPluginOptions
  helpers: GatsbyNodeApiHelpers
}

interface IOptionsProcessor {
  name: string
  test: (options: IProcessorOptions) => boolean
  processor: (options: IProcessorOptions) => IPluginOptions | void
}

const optionsProcessors: Array<IOptionsProcessor> = [
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
      const gatsbyStore = helpers.store.getState()
      const typeSettings = Object.entries(userPluginOptions.type)

      typeSettings.forEach(([typeName, settings]) => {
        const beforeChangeNodePath = settings?.beforeChangeNode

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
  let userPluginOptions = {
    ...pluginOptions,
  }

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

  // remove auth from pluginOptions so we don't leak into the browser
  delete pluginOptions.auth

  return userPluginOptions
}
