import { Form } from "enquirer"
import { getPluginOptionsSchema } from "../../utils/get-plugin-options-schema"

const supportedOptionTypes = [`string`, `boolean`, `number`]

const getPluginOptionTypes = (schema): any => {
  const optionTypes = {}
  Object.entries(schema.describe().keys).forEach(([key, value]) => {
    optionTypes[key] = value.type
  })
  return optionTypes
}

export async function run(): Promise<void> {
  // TODO: Get this from the command
  const pluginName = `gatsby-source-contentful`

  const pluginOptionsSchema = await getPluginOptionsSchema(pluginName)
  const pluginOptionTypes = getPluginOptionTypes(pluginOptionsSchema)

  if (!pluginOptionsSchema) {
    console.log(
      `${pluginName} not found or does not have a pluginOptionsSchema.`
    )
    return
  }

  const { keys: options } = pluginOptionsSchema.describe()

  const choices = Object.keys(options)
    .map(name => {
      const option = options[name]
      const supported = supportedOptionTypes.includes(option.type)
      // TODO: Don't hard code this.
      // Maybe we just allowlist a bunch of options like accessToken, password, token?
      const isSensitive = name === `accessToken`

      return {
        name,
        initial: supportedOptionTypes.includes(typeof option.flags?.default)
          ? option.flags?.default.toString()
          : ``,
        message: name,
        disabled: !supported,
        // coerce inputs on sensitive fields into asterisks
        ...(isSensitive && {
          format: (input): string => `*`.repeat(input.length),
        }),
        // revert input back to the type from the plugin's options schema
        result: (value, choice): string | boolean | number => {
          switch (pluginOptionTypes[choice.name]) {
            case `string`:
              return String(value)
            case `boolean`:
              if (value === `true`) return true
              if (value === `false`) return false
              return value
            case `number`:
              return Number(value)
            default:
              return value
          }
        },
        // hint: option.flags?.description,
      }
    })
    // Order by supported options
    .sort((a, b) => {
      if (a.disabled && !b.disabled) return 0
      if (b.disabled && !a.disabled) return -1
      return 1
    })

  console.log(``)
  const prompt = new Form({
    name: `config`,
    multiple: true,
    message: `Configure ${pluginName}`,
    choices,
  })

  const answers = await prompt.run()
  console.log(answers)
}

run()
