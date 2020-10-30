import { Form } from "enquirer"
import { getPluginOptionsSchema } from "../../utils/get-plugin-options-schema"

const supportedOptionTypes = [`string`, `boolean`, `number`]

export async function run(): Promise<void> {
  // TODO: Get this from the command
  const pluginName = `gatsby-source-contentful`

  const pluginOptionsSchema = await getPluginOptionsSchema(pluginName)

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

      return {
        name,
        initial: supportedOptionTypes.includes(typeof option.flags?.default)
          ? // TODO: Don't toString() this otherwise the answers will have e.g. "false" instead of `false`
            // Might require an upstream fix in enquirer.
            option.flags?.default.toString()
          : ``,
        message: name,
        disabled: !supported,
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
