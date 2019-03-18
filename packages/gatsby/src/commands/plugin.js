const inquirer = require(`inquirer`)
const report = require(`gatsby-cli/lib/reporter`)
const execa = require(`execa`)
const shouldUseYarn = require(`../gatsby-cli/src`).shouldUseYarn

const spawn = cmd => {
  const [file, ...args] = cmd.split(/\s+/)
  return execa(file, args)
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
  }

  return list
}

const getVerbs = verb => {
  switch (verb) {
    case `add`:
      return {
        present: `add`,
        alt: `install`,
        past: `added`,
        participle: `adding`,
        preposition: `to`,
      }
    case `config`:
      return {
        present: `config`,
        past: `configured`,
        participle: `configuring`,
      }
    case `remove`:
      return {
        present: `remove`,
        alt: `uninstall`,
        past: `removed`,
        participle: `removing`,
        preposition: `from`,
      }
    case `search`:
      return {
        present: `search`,
        past: `searched`,
        participle: `searching`,
        preposition: `for`,
      }
    default:
      throw new Error(`Unknown Verb`)
  }
}

const addRemovePlugin = async (action, plugins) => {
  let questions = new Array()

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
      } 'gatsby-config.js' and 'package.json'.\n Are you sure you want to do this?`,
      default: action.present === `add` ? true : false,
    })
  })

  let answers = await inquirer.prompt(questions)

  let confirmedPlugins = new Array()

  plugins.forEach(plugin => {
    if (answers[plugin]) confirmedPlugins.push(plugin)
  })

  let pluginString = makeList(confirmedPlugins)

  if (confirmedPlugins.length > 0) {
    let spinner = report.activity()

    try {
      spinner.tick(`${action.participle} plugin(s): ${confirmedPlugins}`)

      await spawn(
        `${shouldUseYarn() ? `yarn` : `npm`} ${action.present} ${pluginString}`
      )

      report.success(`Successfully ${action.past}: ${pluginString}`)
      spinner.end()

      if (action.present === `add`) {
        confirmedPlugins.forEach(plugin => {
          report.info(
            `For more info on using ${plugin} see: https://www.gatsbyjs.org/packages/${plugin}/`
          )
        })
      }
    } catch (error) {
      spinner.end()
      report.error(
        `Error ${action.participle} plugin(s): ${pluginString}`,
        error.stdout
      )
    }
  } else {
    report.info(`No plugins to ${action.present}`)
  }
}

module.exports = async program => {
  let action = getVerbs(program.action)
  let plugins = program.plugins

  switch (action.present) {
    case `add`:
      await addRemovePlugin(action, plugins)
      break
    case `remove`:
      await addRemovePlugin(action, plugins)
      break
    case `config`:
      report.info(`The future is not yet...but with your PR it could be soon!`)
      break
    case `search`:
      report.info(`The future is not yet...but with your PR it could be soon!`)
      break
  }
}
