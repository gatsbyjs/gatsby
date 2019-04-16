import enquirer from "enquirer"
import execa from "execa"
import fs from "fs"
import path from "path"

import { parse } from "@babel/parser"
import generate from "@babel/generator"
import traverse from "@babel/traverse"
import * as t from "@babel/types"
import prettier from "prettier"

const reporter = require(`gatsby-cli/lib/reporter`)
const loadPlugins = require(`../bootstrap/load-plugins`)
const { store } = require(`../redux`)
import preferDefault from "../bootstrap/prefer-default"
const getConfigFile = require(`../bootstrap/get-config-file`)
const apiRunnerNode = require(`../utils/api-runner-node`)

import PluginConfig from "../config/PluginConfig"

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

const formatConfig = async code => {
  const prettierPath = await prettier.resolveConfigFile(rootPath)
  let prettierConfig = await prettier.resolveConfig(prettierPath)

  const prettyCode = prettier.format(code, {
    parser: `babel`,
    ...prettierConfig,
  })

  return prettyCode
}

const loadInstalledPlugins = async plugins => {
  try {
    let activity = reporter.activityTimer(`open and validate gatsby-configs`)
    activity.start()
    const config = await preferDefault(getConfigFile(rootPath, `gatsby-config`))

    store.dispatch({
      type: `SET_SITE_CONFIG`,
      payload: config,
    })
    activity.end()

    let newBasicConfig = {
      plugins: [],
    }

    plugins.forEach(plugin => {
      newBasicConfig.plugins.push(plugin)
    })

    //Load Plugins
    activity = reporter.activityTimer(`loading plugins`)
    activity.start()
    await loadPlugins(newBasicConfig, rootPath)
    activity.end()
  } catch (err) {
    reporter.panic(`Failed to load plugin(s):`, err)
  }
}

/**
 * Executes onInstall api in all plugins installed provided
 * @param {String[]} plugins - plugins to configure
 * @returns {Promise<Array[PluginConfig]>} Array of plugin configurations
 * @async
 */
const getPluginConfig = async plugins => {
  await loadInstalledPlugins(plugins)

  try {
    return await Promise.all(
      plugins.map(async plugin => {
        let pluginConfig = new PluginConfig(plugin, `root`)
        await apiRunnerNode(`onInstall`, {
          args: {
            prompt: enquirer,
            pluginConfig: pluginConfig,
          },
          plugin,
        })

        return pluginConfig
      })
    )
  } catch (err) {
    throw reporter.panic(`Failed to configure plugin(s):`, err)
  }
}

/**
 * Read currentConfig from file and Parse to AST
 * @return Returns AST of current config
 */
const getCurrentConfigAst = async () => {
  const fileLocation = path.join(rootPath, `gatsby-config.js`)
  const file = fs.readFileSync(fileLocation).toString()
  return parse(file)
}

/**
 * Merges plugin config returned from onInstall API with current config
 * @param {Object} configAst - Current Gatsby Config AST
 * @param {PluginConfig} pluginObject - Plugin config class object.
 */
const addPluginToConfig = (configAst, pluginObject) => {
  const pluginAst = pluginObject.configObjectAst
  traverse(configAst, {
    ObjectProperty(path) {
      if (
        t.isIdentifier(path.node.key, { name: `plugins` }) &&
        pluginObject.pluginParentName === `root` &&
        t.isProgram(path.parentPath.parentPath.parentPath.parentPath)
      ) {
        path.node.value.elements.push(pluginAst)
      }
    },
    StringLiteral(path) {
      if (path.node.value === pluginObject.pluginParentName) {
        if (t.isObjectProperty(path.parentPath.node)) {
          let foundPlugins = false
          path.parentPath.container.forEach(prop => {
            if (t.isIdentifier(prop.key, { name: `plugins` })) {
              foundPlugins = true
              prop.value.elements.push(pluginAst)
            }
          })

          if (!foundPlugins) {
            path.parentPath.insertAfter(
              t.objectProperty(
                t.identifier(`plugins`),
                t.arrayExpression([pluginAst])
              )
            )
          }
        } else {
          path.replaceWith(
            t.objectExpression([
              t.objectProperty(t.identifier(`resolve`), path.node),
            ])
          )
        }
      }
    },
  })
}

const purgePluginFromConfig = (configAst, pluginName) => {
  traverse(configAst, {
    StringLiteral(path) {
      if (
        path.node.value == pluginName &&
        !t.isObjectProperty(path.parentPath)
      ) {
        path.remove()
      }
    },
    ObjectExpression(path) {
      path.node.properties.forEach(prop => {
        if (
          (t.isIdentifier(prop.key, { name: `resolve` }) &&
            t.isStringLiteral(prop.value, { value: pluginName })) ||
          (t.isTemplateLiteral(prop.value) &&
            prop.value.quasis[0].value.raw === pluginName)
        ) {
          path.remove()
        }
      })
    },
    TemplateLiteral(path) {
      path.node.quasis.forEach(quasi => {
        if (
          t.isTemplateElement(quasi) &&
          quasi.value.raw === pluginName &&
          !t.isObjectProperty(path.parentPath)
        ) {
          path.remove()
        }
      })
    },
  })
}

/**
 * // Write a gatsby config to the gatsby-config.js
 * @param {String} newConfig - Config to be written
 */
const writeGatsbyConfigFromAst = async configAST => {
  let code = generate(configAST, {
    comments: true,
    compact: false,
    concise: false,
  }).code

  code = await formatConfig(code)

  fs.writeFile(`gatsby-config-test.js`, code, err => {
    if (err) throw new Error(`gatsby-config.js write error: ${err}`)
  })
}

const confirmPluginActions = async (action, plugins) => {
  let questions = []

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

  return confirmedPlugins
}

/**
 * Add or remove a gatsby plugin from npm and execute onInstall API
 * @param {('add'|'remove')} action - Whether to add or remove plugin
 * @param {String[]} plugins - Array of plugins on which to perform the action
 */
const modifyPluginPackage = async (action, plugins) => {
  const pluginString = makeList(plugins)

  if (plugins.length > 0) {
    let spinner = reporter.activity()

    try {
      spinner.tick(`${action.participle} plugin(s): ${plugins}`)

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

      if (action.present === `add`) {
        plugins.forEach(plugin => {
          reporter.info(
            `For more info on using ${plugin} see: https://www.gatsbyjs.org/packages/${plugin}/`
          )
        })
      }
    } catch (error) {
      reporter.error(
        `Error ${action.participle} plugin(s): ${pluginString}`,
        error
      )
    } finally {
      spinner.end()
    }
  } else {
    reporter.info(`No plugins to ${action.present}`)
  }
}

const configurePlugins = async plugins => {
  let currentConfigAst = await getCurrentConfigAst()

  let pluginConfigs = await getPluginConfig(plugins)

  pluginConfigs.forEach(pluginConfig => {
    purgePluginFromConfig(currentConfigAst, pluginConfig.pluginName)

    addPluginToConfig(currentConfigAst, pluginConfig)
  })

  await writeGatsbyConfigFromAst(currentConfigAst)

  //format updated config??
}

const addAction = async (action, plugins) => {
  let confirmedPlugins = await confirmPluginActions(action, plugins)

  await modifyPluginPackage(action, confirmedPlugins)

  await configurePlugins(plugins)
}

const removeAction = async (action, plugins) => {
  let confirmedPlugins = await confirmPluginActions(action, plugins)

  await modifyPluginPackage(action, confirmedPlugins)

  let currentConfigAst = await getCurrentConfigAst()

  await purgePluginFromConfig(currentConfigAst, plugins)
}

module.exports = program => {
  let action = verbs[program.action]

  rootPath = program.directory
  dryRun = program.dryRun
  confirm = program.confirm

  if (dryRun) {
    reporter.info(
      `Dry Run: The workflow will be unchanged, but nothing will be done in the end.`
    )
  }

  switch (action.present) {
    case `add`:
      addAction(action, program.plugins)
      break
    case `remove`:
      removeAction(action, program.plugins)
      break
    case `config`:
      configurePlugins()
      break
    case `search`:
      reporter.info(
        `The future is not yet...but with your PR it could be soon!`
      )
      break
  }
}
