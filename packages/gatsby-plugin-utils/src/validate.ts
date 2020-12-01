import { GatsbyNode } from "gatsby"
import { ValidationOptions } from "joi"
import { Joi, ObjectSchema } from "./joi"
import { IPluginInfoOptions, IPluginRefObject, ISiteConfig } from "./types"
import path from "path"
import reporter from "gatsby-cli/lib/reporter"
import { stripIndent } from "common-tags"
import { trackCli } from "gatsby-telemetry"

const validationOptions: ValidationOptions = {
  // Show all errors at once, rather than only the first one every time
  abortEarly: false,
  cache: true,
}

interface IOptions {
  validateExternalRules?: boolean
}

export async function validateOptionsSchema(
  pluginSchema: ObjectSchema,
  pluginOptions: IPluginInfoOptions,
  options: IOptions = {
    validateExternalRules: true,
  }
): Promise<IPluginInfoOptions> {
  const { validateExternalRules } = options

  const value = await pluginSchema.validateAsync(pluginOptions, {
    ...validationOptions,
    externals: validateExternalRules,
  })

  return value
}

async function validatePluginsOptions(
  plugins: Array<IPluginRefObject>,
  rootDir: string | null
): Promise<{
  errors: number
  plugins: Array<IPluginRefObject>
}> {
  let errors = 0
  const newPlugins = await Promise.all(
    plugins.map(async plugin => {
      let gatsbyNode

      try {
        gatsbyNode = require(`${plugin.resolve}/gatsby-node`)
      } catch (err) {
        gatsbyNode = {}
      }

      if (!gatsbyNode.pluginOptionsSchema) return plugin

      let optionsSchema = (gatsbyNode.pluginOptionsSchema as Exclude<
        GatsbyNode["pluginOptionsSchema"],
        undefined
      >)({
        Joi,
      })

      // Validate correct usage of pluginOptionsSchema
      if (!Joi.isSchema(optionsSchema) || optionsSchema.type !== `object`) {
        reporter.warn(
          `Plugin "${plugin.resolve}" has an invalid options schema so we cannot verify your configuration for it.`
        )
        return plugin
      }

      try {
        if (!optionsSchema.describe().keys.plugins) {
          // All plugins have "plugins: []"" added to their options in load.ts, even if they
          // do not have subplugins. We add plugins to the schema if it does not exist already
          // to make sure they pass validation.
          optionsSchema = optionsSchema.append({
            plugins: Joi.array().length(0),
          })
        }

        plugin.options = await validateOptionsSchema(
          optionsSchema,
          (plugin.options as IPluginInfoOptions) || {}
        )

        if (plugin.options?.plugins) {
          const {
            errors: subErrors,
            plugins: subPlugins,
          } = await validatePluginsOptions(
            plugin.options.plugins as Array<IPluginRefObject>,
            rootDir
          )
          plugin.options.plugins = subPlugins
          errors += subErrors
        }
      } catch (error) {
        if (error instanceof Joi.ValidationError) {
          // Show a small warning on unknown options rather than erroring
          const validationWarnings = error.details.filter(
            err => err.type === `object.unknown`
          )
          const validationErrors = error.details.filter(
            err => err.type !== `object.unknown`
          )

          // If rootDir and plugin.parentDir are the same, i.e. if this is a plugin a user configured in their gatsby-config.js (and not a sub-theme that added it), this will be ""
          // Otherwise, this will contain (and show) the relative path
          const configDir =
            (plugin.parentDir &&
              rootDir &&
              path.relative(rootDir, plugin.parentDir)) ||
            null
          if (validationErrors.length > 0) {
            reporter.error({
              id: `11331`,
              context: {
                configDir,
                validationErrors,
                pluginName: plugin.resolve,
              },
            })
            errors++
          }

          if (validationWarnings.length > 0) {
            reporter.warn(
              stripIndent(`
                Warning: there are unknown plugin options for "${
                  plugin.resolve
                }"${
                configDir ? `, configured by ${configDir}` : ``
              }: ${validationWarnings
                .map(error => error.path.join(`.`))
                .join(`, `)}
                Please open an issue at ghub.io/${
                  plugin.resolve
                } if you believe this option is valid.
              `)
            )
            trackCli(`UNKNOWN_PLUGIN_OPTION`, {
              name: plugin.resolve,
              valueString: validationWarnings
                .map(error => error.path.join(`.`))
                .join(`, `),
            })
            // We do not increment errors++ here as we do not want to process.exit if there are only warnings
          }

          return plugin
        }

        throw error
      }

      return plugin
    })
  )
  return { errors, plugins: newPlugins }
}

export async function validateConfigPluginsOptions(
  config: ISiteConfig = {},
  rootDir: string | null
): Promise<void> {
  if (!config.plugins) return

  const { errors, plugins } = await validatePluginsOptions(
    config.plugins,
    rootDir
  )

  config.plugins = plugins

  if (errors > 0) {
    process.exit(1)
  }
}
