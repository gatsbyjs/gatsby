import Enquirer from "enquirer"
import cmses from "./questions/cmses.json"
import styles from "./questions/styles.json"
import features from "./questions/features.json"
import { initStarter, getPackageManager, gitSetup } from "./init-starter"
import { installPlugins } from "./install-plugins"
import colors from "ansi-colors"
import path from "path"
import { plugin } from "./components/plugin"
import { makePluginConfigQuestions } from "./plugin-options-form"
import { center, wrap } from "./components/utils"
import { stripIndent } from "common-tags"
import { trackCli } from "./tracking"
import { reporter } from "./utils/reporter"
import { setSiteMetadata } from "./utils/site-metadata"
import { makeNpmSafe } from "./utils/make-npm-safe"
import {
  validateProjectName,
  generateQuestions,
} from "./utils/question-helpers"
import { sha256, md5 } from "./utils/hash"
import { maybeUseEmoji } from "./utils/emoji"

const DEFAULT_STARTER = `https://github.com/gatsbyjs/gatsby-starter-minimal.git`

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

export async function run(): Promise<void> {
  const [flag, siteDirectory] = process.argv.slice(2) // TODO - Refactor this to not be positional in upcoming TS PR since it's related

  let yesFlag = false
  if (flag === `-y`) {
    yesFlag = true
  }

  trackCli(`CREATE_GATSBY_START`)

  const { version } = require(`../package.json`)

  reporter.info(colors.grey(`create-gatsby version ${version}`))

  reporter.info(
    `


${center(colors.blueBright.bold.underline(`Welcome to Gatsby!`))}


`
  )

  if (!yesFlag) {
    reporter.info(
      wrap(
        `This command will generate a new Gatsby site for you in ${colors.bold(
          process.cwd()
        )} with the setup you select. ${colors.white.bold(
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
      format: (value: string): string => colors.cyan(value),
    } as any))

    data = await enquirer.prompt(
      generateQuestions(makeNpmSafe(siteName), yesFlag)
    )
  } else {
    const warn = await validateProjectName(siteDirectory)
    if (typeof warn === `string`) {
      reporter.warn(warn)
      return
    }
    siteName = siteDirectory
    data = await enquirer.prompt(
      generateQuestions(makeNpmSafe(siteDirectory), yesFlag)[0]
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
    `${maybeUseEmoji(
      `🛠  `
    )}Create a new Gatsby site in the folder ${colors.magenta(data.project)}`,
  ]

  const plugins: Array<string> = []
  const packages: Array<string> = []
  let pluginConfig: PluginConfigMap = {}

  if (data.cms && data.cms !== `none`) {
    messages.push(
      `${maybeUseEmoji(
        `📚 `
      )}Install and configure the plugin for ${colors.magenta(
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
      `${maybeUseEmoji(`🎨 `)}Get you set up to use ${colors.magenta(
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
      `${maybeUseEmoji(`🔌 `)}Install ${data.features
        ?.map((feat: string) => colors.magenta(feat))
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

${colors.bold(`Thanks! Here's what we'll now do:`)}

    ${messages.join(`\n    `)}
  `)

    const { confirm } = await new Enquirer<{ confirm: boolean }>().prompt({
      type: `confirm`,
      name: `confirm`,
      initial: `Yes`,
      message: `Shall we do this?`,
      format: value => (value ? colors.greenBright(`Yes`) : colors.red(`No`)),
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
    packages.map((plugin: string) => plugin.split(`:`)[0]),
    siteName
  )

  reporter.success(`Created site in ${colors.green(data.project)}`)

  const fullPath = path.resolve(data.project)

  if (plugins.length) {
    reporter.info(`${maybeUseEmoji(`🔌 `)}Setting-up plugins...`)
    await installPlugins(plugins, pluginConfig, fullPath, [])
  }
  await setSiteMetadata(fullPath, `title`, siteName)

  await gitSetup(data.project)

  const pm = await getPackageManager()
  const runCommand = pm === `npm` ? `npm run` : `yarn`

  reporter.info(
    stripIndent`
    ${maybeUseEmoji(`🎉  `)}Your new Gatsby site ${colors.bold(
      siteName
    )} has been successfully created
    at ${colors.bold(fullPath)}.
    `
  )
  reporter.info(`Start by going to the directory with\n
  ${colors.magenta(`cd ${data.project}`)}
  `)

  reporter.info(`Start the local development server with\n
  ${colors.magenta(`${runCommand} develop`)}
  `)

  reporter.info(`See all commands at\n
  ${colors.blueBright(`https://www.gatsbyjs.com/docs/gatsby-cli/`)}
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
