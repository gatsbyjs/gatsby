const enquirer = require(`enquirer`)
const reporter = require(`gatsby-cli/lib/reporter`)
const execa = require(`execa`)
const preferDefault = require(`../bootstrap/prefer-default`)
const loadPlugins = require(`../bootstrap/load-plugins`)
const { store } = require(`../redux`)
const getConfigFile = require(`../bootstrap/get-config-file`)
const apiRunnerNode = require(`../utils/api-runner-node`)

const spawn = cmd => {
  const [file, ...args] = cmd.split(/\s+/)
  return execa(file, args)
}

let rootPath = ``

// Returns true if yarn exists, false otherwise
const shouldUseYarn = () => {
  try {
    execa.sync(`yarnpkg`, `--version`, { stdio: `ignore` })
    return true
  } catch (e) {
    return false
  }
}

const makeList = array => {
  let list = ``

  switch (array.length) {
    case 1:
      return array[0]
    case 2:
      return `${array[0]} and ${array[1]}`
    default:
      array.forEach((item, index) => {
        if (index < array.length - 1) {
          list += `${item}, `
        } else if (index < array.length) {
          list += `${item}, and`
        } else {
          list += item
        }
      })

      return list
  }
}

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

const configurePlugins = async plugins => {
  // Initialize store and load plugins.
  try {
    let activity = reporter.activityTimer(`open and validate gatsby-configs`)
    activity.start()
    let config = await preferDefault(getConfigFile(rootPath, `gatsby-config`))

    store.dispatch({
      type: `SET_SITE_CONFIG`,
      payload: config,
    })

    activity.end()

    activity = reporter.activityTimer(`load plugins`)
    activity.start()
    await loadPlugins(config, rootPath)
    activity.end()

    plugins.forEach(async plugin => {
      await apiRunnerNode(`onInstall`, {
        existingConfig: {
          prompt: enquirer,
        },
        plugin,
      })
    })
  } catch (err) {
    reporter.panic(`Failed to configure plugin(s):`, err)
  }
}

const addRemovePlugin = async (action, plugins, dryRun) => {
  let questions = new Array()

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

  let answers = await enquirer.prompt(questions)

  let confirmedPlugins = new Array()

  plugins.forEach(plugin => {
    if (answers[plugin]) confirmedPlugins.push(plugin)
  })

  let pluginString = makeList(confirmedPlugins)

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

      spinner.end()

      if (action.present === `add`) {
        await configurePlugins(confirmedPlugins)

        confirmedPlugins.forEach(plugin => {
          reporter.info(
            `For more info on using ${plugin} see: https://www.gatsbyjs.org/packages/${plugin}/`
          )
        })
      }
    } catch (error) {
      spinner.end()
      reporter.error(
        `Error ${action.participle} plugin(s): ${pluginString}`,
        error
      )
    }
  } else {
    reporter.info(`No plugins to ${action.present}`)
  }
}

module.exports = async program => {
  let action = verbs[program.action]
  rootPath = program.directory

  switch (action.present) {
    case `add`:
    case `remove`:
      await addRemovePlugin(action, program.plugins, program.dryRun)
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
