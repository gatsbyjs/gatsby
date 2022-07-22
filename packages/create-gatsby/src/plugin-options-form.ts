import { stripIndent } from "common-tags"
import terminalLink from "terminal-link"
import Joi from "joi"
import pluginSchemas from "./plugin-schemas.json"
import cmses from "./questions/cmses.json"
import styles from "./questions/styles.json"
import colors from "ansi-colors"

const supportedOptionTypes = [`string`, `boolean`, `number`]

type Schema = Joi.Description & {
  // Limitation in Joi typings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  flags?: Record<string, any>
}

type PluginName = keyof typeof pluginSchemas

interface IChoice {
  name: string
  initial: unknown
  message: string
  hint?: string
}
type Choices = Array<IChoice>

type Option = Record<string, Schema> | undefined

interface IFormPrompt {
  type: string
  name: string
  multiple: boolean
  message: string
  choices: Choices
}

function getName(key: string): string | undefined {
  const plugins = [cmses, styles] // "features" doesn't map to names
  for (const types of plugins) {
    if (key in types) {
      return types[key as keyof typeof types].message
    }
  }
  return key
}

function docsLink(pluginName: string): string {
  return colors.blueBright(
    terminalLink(
      `the plugin docs`,
      `https://www.gatsbyjs.com/plugins/${pluginName}/`,
      { fallback: (_, url) => url }
    )
  )
}

const isOptionRequired = ([_, option]: [string, Schema]): boolean =>
  option?.flags?.presence === `required`

const schemaToChoice = ([name, option]: [string, Schema]): IChoice => {
  const hasDefaultValue =
    option.flags?.default &&
    supportedOptionTypes.includes(typeof option.flags?.default)

  return {
    name,
    initial: hasDefaultValue ? option.flags?.default.toString() : undefined,
    message: name,
    hint: option.flags?.description,
  }
}

export const makePluginConfigQuestions = (
  selectedPlugins: Array<string>
): Array<IFormPrompt> => {
  const formPrompts: Array<IFormPrompt> = []

  selectedPlugins.forEach((pluginName: string): void => {
    const schema = pluginSchemas[pluginName as PluginName]

    if (!schema || typeof schema === `string` || !(`keys` in schema)) {
      return
    }
    const options: Option = schema?.keys

    if (!options) {
      return
    }

    const choices: Choices = Object.entries(options)
      .filter(isOptionRequired)
      .map(schemaToChoice)

    if (choices.length > 0) {
      formPrompts.push({
        type: `forminput`,
        name: pluginName,
        multiple: true,
        message: stripIndent`
          Configure the ${getName(pluginName)} plugin.
          See ${docsLink(pluginName)} for help.
          ${
            choices.length > 1
              ? colors.green(
                  `Use arrow keys to move between fields, and enter to finish`
                )
              : ``
          }
          `,
        choices,
      })
    }
  })

  return formPrompts
}
