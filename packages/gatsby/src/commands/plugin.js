const enquirer = require(`enquirer`)
const execa = require(`execa`)
const fs = require(`fs`)
const path = require(`path`)
const { parse } = require(`@babel/parser`)
const generate = require(`@babel/generator`).default
const prettier = require(`prettier`)

const reporter = require(`gatsby-cli/lib/reporter`)
const preferDefault = require(`../bootstrap/prefer-default`)
const loadPlugins = require(`../bootstrap/load-plugins`)
const { store } = require(`../redux`)
const getConfigFile = require(`../bootstrap/get-config-file`)
const apiRunnerNode = require(`../utils/api-runner-node`)

/*
 * Values
 */
const verbs = {
  add: {
    present: `add`,
    alt: `install`,
    past: `added`,
    participle: `adding`,
    preposition: `to`,
  },
  config: {
    present: `config`,
    past: `configured`,
    participle: `configuring`,
  },
  remove: {
    present: `remove`,
    alt: `uninstall`,
    past: `removed`,
    participle: `removing`,
    preposition: `from`,
  },
  search: {
    present: `search`,
    past: `searched`,
    participle: `searching`,
    preposition: `for`,
  },
}

let rootPath = ``
let dryRun = false
let confirm = false

/*
 * Internal Functions
 */

// Executes something on command-line
const spawn = cmd => {
  const [file, ...args] = cmd.split(/\s+/)
  return execa(file, args)
}

// Returns true if yarn exists, false otherwise
const shouldUseYarn = () => {
  try {
    execa.sync(`yarnpkg`, `--version`, { stdio: `ignore` })
    return true
  } catch (e) {
    return false
  }
}

/**
 * Makes a human readable list from an array
 * @param {String[]} a - Array of strings to join into list.
 */
const makeList = function(a) {
  return [a.slice(0, a.length - 1 || 1).join(`, `)]
    .concat(a.slice().splice(-1, Number(a.length > 1)))
    .join(` and `)
}

/**
 * Executes onInstall api in all plugins installed provided
 * @param {String[]} plugins - plugins to configure
 */
const configurePlugins = async plugins => {
  // Initialize store and load plugins.
  try {
    let activity = reporter.activityTimer(`open and validate gatsby-configs`)
    activity.start()
    const config = await preferDefault(getConfigFile(rootPath, `gatsby-config`))

    store.dispatch({
      type: `SET_SITE_CONFIG`,
      payload: config,
    })
    activity.end()

    // Set Basic Config

    let newBasicConfig = { ...config }

    plugins.forEach(plugin => {
      newBasicConfig.plugins.push(plugin)
    })

    //Load Plugins
    activity = reporter.activityTimer(`load plugins`)
    activity.start()
    await loadPlugins(newBasicConfig, rootPath)
    activity.end()

    plugins.forEach(async plugin => {
      let pluginConfig = await apiRunnerNode(`onInstall`, {
        args: {
          prompt: enquirer,
        },
        plugin,
      })

      if (pluginConfig !== []) {
        const fileLocation = path.join(rootPath, `gatsby-config.js`)
        const file = fs.readFileSync(fileLocation).toString()
        const currentConfigAST = parse(file, { strictMode: true })

        // let newConfig = pluginConfig[0]

        // console.log("newConfig", newConfig)

        // let mergedConfig = appendPluginConfig(config, newConfig)

        // console.log("returned config", mergedConfig)

        await writeGatsbyConfig(currentConfigAST)
      }
    })
  } catch (err) {
    reporter.panic(`Failed to configure plugin(s):`, err)
  }
}

/**
 * Merges plugin config returned from onInstall API with current config
 * @param {Object} oldConfig - Current Gatsby Config
 * @param {Object} pluginConfig - Plugin config.
 * @returns {Object} - Returns merged Gatsby config and new plugin config
 */
const appendPluginConfig = (oldConfig, pluginConfig) => {
  // console.log(pluginConfig)
  if (typeof pluginConfig == String) {
    return oldConfig
  } else if (pluginConfig[`resolve`]) {
    let jointPlugins = oldConfig.plugins.map(plugin => {
      if (plugin === pluginConfig.resolve) {
        plugin = pluginConfig
      }
      return plugin
    })

    oldConfig.plugins = jointPlugins
    return oldConfig
  } else {
    throw `Invalid plugin config: ${pluginConfig}`
  }
}

/**
 * // Write a gatsby config to the gatsby-config.js
 * @param {String} newConfig - Config to be written
 */
const writeGatsbyConfig = async newConfig => {
  // convert to String
  const configString = generate(newConfig, {
    comments: true,
    compact: false,
    concise: false,
  }).code

  //format with prettier
  // const prettierPath = await prettier.resolveConfigFile(rootPath)
  // let prettierConfig = await prettier.resolveConfig(prettierPath)

  // const prettyConfigString = prettier.format(configString, {
  //   parser: `babel`,
  //   ...prettierConfig,
  // })

  // //get config path
  // const configPath = path.join(rootPath, `gatsby-config-test.js`)

  fs.writeFile(`gatsby-config-test.js`, configString, err => {
    if (err) throw new Error(`addToReducerIndex.js write error: ${err}`)
  })
}

/**
 * Add or remove a gatsby plugin from npm and execute onInstall API
 * @param {('add'|'remove')} action - Whether to add or remove plugin
 * @param {String[]} plugins - Array of plugins on which to perform the action
 */
const addRemovePlugin = async (action, plugins) => {
  let questions = []

  if (dryRun) {
    reporter.info(
      `Dry Run: The workflow will be unchanged, but nothing will be done in the end.`
    )
  }

  plugins.forEach((plugin, index, plugins) => {
    if (!plugin.startsWith(`gatsby-`)) {
      plugin = `gatsby-` + plugin
      plugins[index] = plugin
    }

    questions.push({
      type: `confirm`,
      name: plugin,
      message: `You are about to ${action.alt} ${plugin}. This will ${
        action.present
      } it ${
        action.preposition
      } 'package.json'.\n Are you sure you want to do this?`,
    })
  })

  let confirmedPlugins = []
  let answers = []
  if (confirm) {
    confirmedPlugins = plugins
  } else {
    answers = await enquirer.prompt(questions)

    confirmedPlugins = plugins.map(plugin => {
      if (answers[plugin]) {
        return plugin
      }
      return null
    })
  }

  const pluginString = makeList(confirmedPlugins)

  if (confirmedPlugins.length > 0) {
    let spinner = reporter.activity()

    try {
      spinner.tick(`${action.participle} plugin(s): ${confirmedPlugins}`)

      if (dryRun) {
        reporter.info(
          `Dry Run: Usually I'd be installing stuff right now, but this is a dry run!`
        )
      } else {
        await spawn(
          `${shouldUseYarn() ? `yarn` : `npm`} ${
            action.present
          } ${pluginString}`
        )
      }
      reporter.success(`Successfully ${action.past}: ${pluginString}`)
    } catch (error) {
      reporter.error(
        `Error ${action.participle} plugin(s): ${pluginString}`,
        error
      )
    } finally {
      spinner.end()
    }

    if (action.present === `add`) {
      confirmedPlugins.forEach(plugin => {
        reporter.info(
          `For more info on using ${plugin} see: https://www.gatsbyjs.org/packages/${plugin}/`
        )
      })

      await configurePlugins(confirmedPlugins)
    }
  } else {
    reporter.info(`No plugins to ${action.present}`)
  }
}

module.exports = async program => {
  let action = verbs[program.action]

  rootPath = program.directory
  dryRun = program.dryRun
  confirm = program.confirm

  switch (action.present) {
    case `add`:
    case `remove`:
      await addRemovePlugin(action, program.plugins)
      break
    case `config`:
      reporter.info(
        `The future is not yet...but with your PR it could be soon!`
      )
      break
    case `search`:
      reporter.info(
        `The future is not yet...but with your PR it could be soon!`
      )
      break
  }
}
