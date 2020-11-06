import Enquirer, { Prompt } from "enquirer"
import cmses from "./cmses.json"
import styles from "./styles.json"
import features from "./features.json"
import { initStarter } from "./init-starter"
import { installPlugins } from "./install-plugins"
import c from "ansi-colors"
import path from "path"
import fs from "fs"
// @ts-ignore
import { TextInput } from "./components/text"
// @ts-ignore
import { SelectInput, MultiSelectInput } from "./components/select"
import { makePluginConfigQuestions } from "./plugin-options-form"
import { center, rule, wrap } from "./components/utils"

// eslint-disable-next-line no-control-regex
const INVALID_FILENAMES = /[<>:"/\\|?*\u0000-\u001F]/g
const INVALID_WINDOWS = /^(con|prn|aux|nul|com\d|lpt\d)$/i

// We're using a fork because it points to the canary version of gatsby
const DEFAULT_STARTER = `https://github.com/ascorbic/gatsby-starter-hello-world.git`

const makeChoices = (
  options: Record<string, { message: string; dependencies?: Array<string> }>,
  multi = false
): Array<{ message: string; name: string; disabled?: boolean }> => {
  const entries = Object.entries(options).map(([name, message]) => {
    return { name, message: message.message }
  })

  if (multi) {
    return entries
  }
  const none = { name: `none`, message: `No (or I'll add it later)` }
  const divider = { name: `–`, role: `separator`, message: `–` }

  return [none, divider, ...entries]
}

const questions = [
  {
    type: `textinput`,
    name: `project`,
    message: `What would you like to name the folder where your site will be created?`,
    hint: path.basename(process.cwd()),
    separator: `/`,
    initial: `my-gatsby-site`,
    format: (value: string): string => c.cyan(value),
    validate: (value: string): string | boolean => {
      if (INVALID_FILENAMES.test(value)) {
        return `The destination "${value}" is not a valid filename. Please try again, avoiding special characters.`
      }
      if (process.platform === `win32` && INVALID_WINDOWS.test(value)) {
        return `The destination "${value}" is not a valid Windows filename. Please try another name`
      }
      if (fs.existsSync(path.resolve(value))) {
        return `The destination "${value}" already exists. Please choose a different name`
      }
      return true
    },
  },
  {
    type: `selectinput`,
    name: `cms`,
    message: `Will you be using a CMS?`,
    hint: `(Single choice) Arrow keys to move, enter to confirm`,
    choices: makeChoices(cmses),
  },
  {
    type: `selectinput`,
    name: `styling`,
    message: `Would you like to install a styling system?`,
    hint: `(Single choice) Arrow keys to move, enter to confirm`,
    choices: makeChoices(styles),
  },
  {
    type: `multiselectinput`,
    name: `features`,
    message: `Would you like to install additional features with other plugins?`,
    hint: `(Multiple choice) Use arrow keys to move, spacebar to select, and enter to confirm your choices`,
    choices: makeChoices(features, true),
  },
]
interface IAnswers {
  project: string
  styling?: keyof typeof styles
  cms?: keyof typeof cmses
  features?: Array<keyof typeof features>
}

interface IPluginEntry {
  message: string
  dependencies?: Array<string>
}

export type PluginMap = Record<string, IPluginEntry>

export async function run(): Promise<void> {
  const { version } = require(`../package.json`)

  console.log(c.grey(`create-gatsby version ${version}`))

  console.log(
    `


${center(c.blueBright.bold.underline(`Welcome to Gatsby!`))}
   
                
`
  )
  console.log(c.red(rule()))
  console.log(center(c.red(`⚠️  This is currently for testing purposes only`)))
  console.log(c.red(rule()))

  console.log(
    wrap(
      `This command will generate a new Gatsby site for you in ${c.bold(
        process.cwd()
      )} with the setup you select. ${c.white.bold(
        `Let's answer some questions:\n`
      )}`,
      process.stdout.columns
    )
  )
  console.log(``)

  const enquirer = new Enquirer<IAnswers>()
  enquirer.register(`textinput`, (TextInput as unknown) as typeof Prompt)
  enquirer.register(`selectinput`, (SelectInput as unknown) as typeof Prompt)
  enquirer.register(
    `multiselectinput`,
    (MultiSelectInput as unknown) as typeof Prompt
  )

  const data = await enquirer.prompt(questions)

  const messages: Array<string> = [
    `🛠  Create a new Gatsby site in the folder ${c.magenta(data.project)}`,
  ]

  const plugins: Array<string> = []
  const packages: Array<string> = []

  if (data.cms && data.cms !== `none`) {
    messages.push(
      `📚 Install and configure the plugin for ${c.magenta(
        cmses[data.cms].message
      )}`
    )
    plugins.push(data.cms)
    packages.push(data.cms, ...(cmses[data.cms].dependencies || []))
  }

  if (data.styling && data.styling !== `none`) {
    messages.push(
      `🎨 Get you set up to use ${c.magenta(
        styles[data.styling].message
      )} for styling your site`
    )
    plugins.push(data.styling)
    packages.push(data.styling, ...(styles[data.styling].dependencies || []))
  }

  if (data.features?.length) {
    messages.push(
      `🔌 Install ${data.features
        ?.map((feat: string) => c.magenta(feat))
        .join(`, `)}`
    )
    plugins.push(...data.features)
    const featureDependencies = data.features?.map(
      featureKey => features[featureKey].dependencies || []
    )
    const flattenedDependencies = ([] as Array<string>).concat.apply(
      [],
      featureDependencies
    ) // here until we upgrade to node 11 and can use flatMap

    packages.push(...data.features, ...flattenedDependencies)
  }

  const config = makePluginConfigQuestions(plugins)
  let pluginConfig
  if (config.length) {
    console.log(
      `\nGreat! A few of the selections you made need to be configured. Please fill in the options for each plugin now:\n`
    )
    pluginConfig = await new Enquirer<Record<string, {}>>().prompt(config)
  }

  console.log(`

${c.bold(`Thanks! Here's what we'll now do:`)}

    ${messages.join(`\n    `)}
  `)

  const { confirm } = await new Enquirer<{ confirm: boolean }>().prompt({
    type: `confirm`,
    name: `confirm`,
    initial: `Yes`,
    message: `Shall we do this?`,
    format: value => (value ? c.greenBright(`Yes`) : c.red(`No`)),
  })

  if (!confirm) {
    console.log(`OK, bye!`)
    return
  }

  await initStarter(DEFAULT_STARTER, data.project)

  console.log(c.green(`✔ `) + `Created site in ` + c.green(data.project))

  if (plugins.length) {
    console.log(c.bold(`🔌 Installing plugins...`))
    await installPlugins(
      plugins,
      pluginConfig,
      path.resolve(data.project),
      packages
    )
  }

  console.log(
    `✨ Your new Gatsby site ${c.bold(
      path.resolve(data.project)
    )} has been successfully bootstrapped at ${c.bold(
      data.project
    )}. There you can:\n`
  )
  console.log(`
  Start developing with\n
  ${c.magenta(`gatsby develop`)}\n
  `)

  console.log(`
  Create a production build with\n
  ${c.magenta(`gatsby build`)}\n
  `)

  console.log(`
  Head to your new project with\n
  ${c.magenta(`cd ${data.project}`)}\n
  `)
}
