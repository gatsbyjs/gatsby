import Enquirer from "enquirer"
import cmses from "./cmses.json"
import styles from "./styles.json"
import features from "./features.json"
import { initStarter, getPackageManager, gitSetup } from "./init-starter"
import { installPlugins } from "./install-plugins"
import c from "ansi-colors"
import path from "path"
import fs from "fs"
import { plugin } from "./components/plugin"
import { makePluginConfigQuestions } from "./plugin-options-form"
import { center, wrap } from "./components/utils"
import { stripIndent } from "common-tags"
import { trackCli } from "./tracking"
import crypto from "crypto"
import { reporter } from "./reporter"
import { setSiteMetadata } from "./site-metadata"
import { makeNpmSafe } from "./utils"
import { requireResolve } from "./require-utils"

const sha256 = (str: string): string =>
  crypto.createHash(`sha256`).update(str).digest(`hex`)

const md5 = (str: string): string =>
  crypto.createHash(`md5`).update(str).digest(`hex`)

/**
 * Hide string on windows (for emojis)
 */
const w = (input: string): string => (process.platform === `win32` ? `` : input)

// eslint-disable-next-line no-control-regex
const INVALID_FILENAMES = /[<>:"/\\|?*\u0000-\u001F]/g
const INVALID_WINDOWS = /^(con|prn|aux|nul|com\d|lpt\d)$/i

const DEFAULT_STARTER = `https://github.com/gatsbyjs/gatsby-starter-minimal.git`

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

export const validateProjectName = async (
  value: string
): Promise<string | boolean> => {
  if (!value) {
    return `You have not provided a directory name for your site. Please do so when running with the 'y' flag.`
  }
  value = value.trim()
  if (INVALID_FILENAMES.test(value)) {
    return `The destination "${value}" is not a valid filename. Please try again, avoiding special characters.`
  }
  if (value === '.') {
    return true;
  }
  if (process.platform === `win32` && INVALID_WINDOWS.test(value)) {
    return `The destination "${value}" is not a valid Windows filename. Please try another name`
  }
  if (fs.existsSync(path.resolve(value))) {
    return `The destination "${value}" already exists. Please choose a different name`
  }
  return true
}

// The enquirer types are not accurate
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const questions = (initialFolderName: string, skip: boolean): any => [
  {
    type: `textinput`,
    name: `project`,
    message: `What would you like to name the folder where your site will be created?`,
    hint: path.basename(process.cwd()),
    separator: `/`,
    initial: initialFolderName,
    format: (value: string): string => c.cyan(value),
    validate: validateProjectName,
    skip,
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
    hint: `(Multiple choice) Use arrow keys to move, enter to select, and choose "Done" to confirm your choices`,
    choices: makeChoices(features, true),
  },
]
interface IAnswers {
  name: string
  project: string
  styling?: keyof typeof styles
  cms?: keyof typeof cmses
  features?: Array<keyof typeof features>
}

/**
 * Interface for plugin JSON files
 */
interface IPluginEntry {
  /**
   * Message displayed in the menu when selecting the plugin
   */
  message: string
  /**
   * Extra NPM packages to install
   */
  dependencies?: Array<string>
  /**
   * Items are either the plugin name, or the plugin name and key, separated by a colon (":")
   * This allows duplicate entries for plugins such as gatsby-source-filesystem.
   */
  plugins?: Array<string>
  /**
   * Keys must match plugin names or name:key combinations from the plugins array
   */
  options?: PluginConfigMap
}

export type PluginMap = Record<string, IPluginEntry>

export type PluginConfigMap = Record<string, Record<string, unknown>>

const removeKey = (plugin: string): string => plugin.split(`:`)[0]

export async function run(): Promise<void> {
  const [flag, siteDirectory] = process.argv.slice(2)

  let yesFlag = false
  if (flag === `-y`) {
    yesFlag = true
  }

  trackCli(`CREATE_GATSBY_START`)

  const { version } = require(`../package.json`)

  reporter.info(c.grey(`create-gatsby version ${version}`))

  reporter.info(
    `


${center(c.blueBright.bold.underline(`Welcome to Gatsby!`))}


`
  )

  if (!yesFlag) {
    reporter.info(
      wrap(
        `This command will generate a new Gatsby site for you in ${c.bold(
          process.cwd()
        )} with the setup you select. ${c.white.bold(
          `Let's answer some questions:\n\n`
        )}`,
        process.stdout.columns
      )
    )
  }

  const enquirer = new Enquirer<IAnswers>()

  enquirer.use(plugin)

  let data
  let siteName
  if (!yesFlag) {
    ;({ name: siteName } = await enquirer.prompt({
      type: `textinput`,
      name: `name`,
      message: `What would you like to call your site?`,
      initial: `My Gatsby Site`,
      format: (value: string): string => c.cyan(value),
    } as any))

    data = await enquirer.prompt(questions(makeNpmSafe(siteName), yesFlag))
  } else {
    const warn = await validateProjectName(siteDirectory)
    if (typeof warn === `string`) {
      reporter.warn(warn)
      return
    }
    siteName = siteDirectory
    data = await enquirer.prompt(
      questions(makeNpmSafe(siteDirectory), yesFlag)[0]
    )
  }

  data.project = data.project.trim()

  trackCli(`CREATE_GATSBY_SELECT_OPTION`, {
    name: `project_name`,
    valueString: sha256(data.project),
  })
  trackCli(`CREATE_GATSBY_SELECT_OPTION`, {
    name: `CMS`,
    valueString: data.cms || `none`,
  })
  trackCli(`CREATE_GATSBY_SELECT_OPTION`, {
    name: `CSS_TOOLS`,
    valueString: data.styling || `none`,
  })
  trackCli(`CREATE_GATSBY_SELECT_OPTION`, {
    name: `PLUGIN`,
    valueStringArray: data.features || [],
  })

  const messages: Array<string> = [
    `${w(`🛠  `)}Create a new Gatsby site in the folder ${c.magenta(
      data.project
    )}`,
  ]

  const plugins: Array<string> = []
  const packages: Array<string> = []
  let pluginConfig: PluginConfigMap = {}

  if (data.cms && data.cms !== `none`) {
    messages.push(
      `${w(`📚 `)}Install and configure the plugin for ${c.magenta(
        cmses[data.cms].message
      )}`
    )
    const extraPlugins = cmses[data.cms].plugins || []
    plugins.push(data.cms, ...extraPlugins)
    packages.push(
      data.cms,
      ...(cmses[data.cms].dependencies || []),
      ...extraPlugins
    )
    pluginConfig = { ...pluginConfig, ...cmses[data.cms].options }
  }

  if (data.styling && data.styling !== `none`) {
    messages.push(
      `${w(`🎨 `)}Get you set up to use ${c.magenta(
        styles[data.styling].message
      )} for styling your site`
    )
    const extraPlugins = styles[data.styling].plugins || []

    plugins.push(data.styling, ...extraPlugins)
    packages.push(
      data.styling,
      ...(styles[data.styling].dependencies || []),
      ...extraPlugins
    )
    pluginConfig = { ...pluginConfig, ...styles[data.styling].options }
  }

  if (data.features?.length) {
    messages.push(
      `${w(`🔌 `)}Install ${data.features
        ?.map((feat: string) => c.magenta(feat))
        .join(`, `)}`
    )
    plugins.push(...data.features)
    const featureDependencies = data.features?.map(featureKey => {
      const extraPlugins = features[featureKey].plugins || []
      plugins.push(...extraPlugins)
      return [
        // Spread in extra dependencies
        ...(features[featureKey].dependencies || []),
        // Spread in plugins
        ...extraPlugins,
      ]
    })
    const flattenedDependencies = ([] as Array<string>).concat.apply(
      [],
      featureDependencies
    ) // here until we upgrade to node 11 and can use flatMap

    packages.push(...data.features, ...flattenedDependencies)
    // Merge plugin options
    pluginConfig = data.features.reduce((prev, key) => {
      return { ...prev, ...features[key].options }
    }, pluginConfig)
  }

  const config = makePluginConfigQuestions(plugins)
  if (config.length) {
    reporter.info(
      `\nGreat! A few of the selections you made need to be configured. Please fill in the options for each plugin now:\n`
    )

    trackCli(`CREATE_GATSBY_SET_PLUGINS_START`)

    const enquirer = new Enquirer<Record<string, Record<string, unknown>>>()
    enquirer.use(plugin)

    pluginConfig = { ...pluginConfig, ...(await enquirer.prompt(config)) }

    trackCli(`CREATE_GATSBY_SET_PLUGINS_STOP`)
  }
  if (!yesFlag) {
    reporter.info(`

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
      trackCli(`CREATE_GATSBY_CANCEL`)

      reporter.info(`OK, bye!`)
      return
    }
  }

  await initStarter(
    DEFAULT_STARTER,
    data.project,
    packages.map(removeKey),
    siteName
  )

  reporter.success(`Created site in ${c.green(data.project)}`)

  const fullPath = path.resolve(data.project)

  if (plugins.length) {
    reporter.info(`${w(`🔌 `)}Setting-up plugins...`)
    await installPlugins(plugins, pluginConfig, fullPath, [])
  }
  await setSiteMetadata(fullPath, `title`, siteName)

  await gitSetup(data.project)

  const pm = await getPackageManager()
  const runCommand = pm === `npm` ? `npm run` : `yarn`

  reporter.info(
    stripIndent`
    ${w(`🎉  `)}Your new Gatsby site ${c.bold(
      siteName
    )} has been successfully created
    at ${c.bold(fullPath)}.
    `
  )
  reporter.info(`Start by going to the directory with\n
  ${c.magenta(`cd ${data.project}`)}
  `)

  reporter.info(`Start the local development server with\n
  ${c.magenta(`${runCommand} develop`)}
  `)

  reporter.info(`See all commands at\n
  ${c.blueBright(`https://www.gatsbyjs.com/docs/gatsby-cli/`)}
  `)

  const siteHash = md5(fullPath)
  trackCli(`CREATE_GATSBY_SUCCESS`, { siteHash })
}

process.on(`exit`, exitCode => {
  trackCli(`CREATE_GATSBY_END`, { exitCode })

  if (exitCode === -1) {
    trackCli(`CREATE_GATSBY_ERROR`)
  }
})
