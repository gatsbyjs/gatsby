import { Form } from "enquirer"
import reporter from "gatsby-cli/lib/reporter"
import { Joi, ObjectSchema, validateOptionsSchema } from "gatsby-plugin-utils"
import { getPluginOptionsSchema } from "../../utils/get-plugin-options-schema"

const supportedOptionTypes = [`string`, `boolean`, `number`]

const getPluginOptionTypes = (schema): any => {
  const optionTypes = {}
  Object.entries(schema.describe().keys).forEach(([key, value]) => {
    optionTypes[key] = value.type
  })
  return optionTypes
}

const promptForPluginOptions = async (
  pluginName: string,
  pluginOptionsSchema: ObjectSchema
): any => {
  const pluginOptionTypes = getPluginOptionTypes(pluginOptionsSchema)

  const { keys: options } = pluginOptionsSchema.describe()

  const choices = Object.keys(options)
    .map(name => {
      const option = options[name]
      const supported = supportedOptionTypes.includes(option.type)
      // TODO: Don't hard code this.
      // Maybe we just allowlist a bunch of options like accessToken, password, token?
      const isSensitive = name === `accessToken`

      console.log(
        name,
        supportedOptionTypes.includes(typeof option.flags?.default)
      )
      return {
        name,
        initial:
          option.flags?.default &&
          supportedOptionTypes.includes(typeof option.flags?.default)
            ? option.flags?.default.toString()
            : undefined,
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
    validate: async (answers): Promise<string | boolean> => {
      // TODO: This doesn't quite work.
      return true
      try {
        await validateOptionsSchema(pluginOptionsSchema, answers)
        return true
      } catch (error) {
        if (error instanceof Joi.ValidationError) {
          return error.details.map(error => `- ${error.message}`).join(`\n`)
        }

        throw error
      }
    },
  })

  const answers = await prompt.run()
  return answers
}

export default async function run({ plugins }: IProgram): Promise<void> {
  if (!plugins?.length) {
    console.log(`No plugins specified to configure.`)
    return
  }

  for (let i = 0; i < plugins.length; i++) {
    const pluginName = plugins[i]
    const pluginOptionsSchema = await getPluginOptionsSchema(pluginName)
    if (!pluginOptionsSchema) {
      console.log(
        `${pluginName} not found or does not have a pluginOptionsSchema.`
      )
    } else {
      const answers = await promptForPluginOptions(
        pluginName,
        pluginOptionsSchema
      )
      console.log(answers)
    }
  }
}
