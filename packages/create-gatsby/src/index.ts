import { prompt } from "enquirer"
import cmses from "./cmses.json"
import styles from "./styles.json"
import features from "./features.json"
import pluginSchemas from "./plugin-schemas.json"
import { initStarter } from "./init-starter"
import { installPlugins } from "./install-plugins"
import c from "ansi-colors"
import path from "path"
import type Joi from "joi"

const makeChoices = (
  options: Record<string, string>
): Array<{ message: string; name: string }> =>
  Object.entries(options).map(([name, message]) => {
    return { name, message }
  })

const questions = [
  {
    type: `input`,
    name: `project`,
    message: `What would you like to name the folder where your site will be created?`,
    initial: `my-gatsby-site`,
  },
  {
    type: `select`,
    name: `cms`,
    message: `Will you be using a CMS?`,
    hint: `Use arrow keys to move, and enter to select`,
    choices: makeChoices(cmses),
  },
  {
    type: `select`,
    name: `styling`,
    message: `Would you like to install a styling system?`,
    hint: `Use arrow keys to move, and enter to select`,
    choices: makeChoices(styles),
  },
  {
    type: `multiselect`,
    name: `features`,
    message: `Would you like to install additional features with other plugins?`,
    hint: `Use arrow keys to move, spacebar to select, and enter to confirm your choices`,
    choices: makeChoices(features),
  },
]

const supportedOptionTypes = [`string`, `boolean`, `number`]

type PluginName = keyof typeof pluginSchemas
type Schema = Joi.Description & {
  // Limitation in Joi typings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  flags?: Record<string, any>
}

const makePluginConfigQuestions = (
  selectedPlugins: Array<PluginName>
): Array<any> => {
  const formPrompts = selectedPlugins.map((pluginName: PluginName) => {
    const schema = pluginSchemas[pluginName]
    if (typeof schema === `string` || !(`keys` in schema)) {
      return []
    }
    const options: Record<string, Schema> | undefined = schema?.keys
    const choices: Array<{
      name: string
      initial: string
      message: string
    }> = []

    Object.entries(options).forEach(([name, option]) => {
      if (option?.flags?.presence !== `required`) {
        return
      }
      choices.push({
        name,
        initial:
          option.flags?.default &&
          supportedOptionTypes.includes(typeof option.flags?.default)
            ? option.flags?.default.toString()
            : undefined,
        message: name,
      })
    })

    return {
      type: `form`,
      name: `config-${pluginName}`,
      multiple: true,
      message: `Configure required fields for ${pluginName}:`,
      choices,
    }
  })
  return formPrompts
}

interface IAnswers {
  project: string
  styling?: keyof typeof styles
  cms?: keyof typeof cmses
  features?: Array<keyof typeof features>
}

export async function run(): Promise<void> {
  console.log(
    `


                         ${c.blueBright.bold.underline(`Welcome to Gatsby!`)}
   
                
`
  )

  console.log(
    c.red.italic(`Important: This is currently for testing purposes only`)
  )
  console.log(
    `This command will generate a new Gatsby site for you with the setup you select.`
  )
  console.log(`Let's answer some questions:\n`)
  const data = await prompt<IAnswers>(questions)

  const messages: Array<string> = [
    `🛠  Create a new Gatsby site in the folder ${c.blueBright(data.project)}`,
  ]

  const plugins: Array<PluginName> = []

  if (data.cms && data.cms !== `none`) {
    messages.push(
      `📚 Install and configure the plugin for ${c.red(cmses[data.cms])}`
    )
    plugins.push(data.cms)
  }

  if (data.styling && data.styling !== `none`) {
    messages.push(
      `🎨 Get you set up to use ${c.green(
        styles[data.styling]
      )} for styling your site`
    )
    plugins.push(data.styling)
  }

  if (data.features?.length) {
    messages.push(
      `🔌 Install ${data.features
        .map((feat: string) => c.magenta(feat))
        .join(`, `)}`
    )
    plugins.push(...data.features)
  }

  console.log(
    `\nGreat! A few of the selections you made need to be configured, fill in the options for each plugin now:\n`
  )
  const pluginConfig = await prompt<IAnswers>(
    makePluginConfigQuestions(plugins)
  )
  console.log(pluginConfig)

  console.log(`

${c.bold(`Thanks! Here's what we'll now do:`)}

    ${messages.join(`\n    `)}
  `)

  const { confirm } = await prompt<{ confirm: boolean }>({
    type: `confirm`,
    choices: [`Yes`, `No`],
    name: `confirm`,
    message: `Shall we do this?`,
  })

  if (!confirm) {
    console.log(`OK, bye!`)
    process.exit(0)
  }

  await initStarter(
    `https://github.com/gatsbyjs/gatsby-starter-hello-world.git`,
    data.project
  )

  console.log(c.bold.green(`Installing plugins...`))

  await installPlugins(plugins, path.resolve(data.project))
}
