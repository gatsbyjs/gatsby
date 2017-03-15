/* @flow weak */
import { graphql } from "graphql"
import Promise from "bluebird"
import queryRunner from "../utils/query-runner"
import { pagesDB, siteDB, programDB } from "../utils/globals"
import path from "path"
import glob from "glob"
import _ from "lodash"
import createPath from "./create-path"
import mkdirp from "mkdirp"
import fs from "fs-extra"
import Joi from "joi"
import chalk from "chalk"
const { layoutComponentChunkName } = require("../utils/js-chunk-names")

const mkdirs = Promise.promisify(fs.mkdirs)
const copy = Promise.promisify(fs.copy)
const removeDir = Promise.promisify(fs.remove)

// Joi schemas
import { gatsbyConfigSchema, pageSchema } from "../joi-schemas/joi"

import apiRunnerNode from "../utils/api-runner-node"

Promise.onPossiblyUnhandledRejection(error => {
  throw error
})
process.on(`unhandledRejection`, error => {
  console.error(`UNHANDLED REJECTION`, error.stack)
})

// Path creator.
// Auto-create pages.
// algorithm is glob /pages directory for js/jsx/cjsx files *not*
// underscored. Then create url w/ our path algorithm *unless* user
// takes control of that page component in gatsby-node.
const autoPathCreator = program =>
  new Promise(resolve => {
    const pagesDirectory = path.join(program.directory, `pages`)
    let autoPages = []
    glob(`${pagesDirectory}/**/?(*.js|*.jsx|*.cjsx)`, (err, files) => {
      // Create initial page objects.
      autoPages = files.map(filePath => ({
        component: filePath,
        componentChunkName: layoutComponentChunkName(
          program.directory,
          filePath,
        ),
        path: filePath,
      }))

      // Convert path to one relative to the pages directory.
      autoPages = autoPages.map(page => ({
        ...page,
        path: path.relative(pagesDirectory, page.path),
      }))

      // Remove pages starting with an underscore.
      autoPages = _.filter(autoPages, page => page.path.slice(0, 1) !== `_`)

      // Remove page templates.
      autoPages = _.filter(
        autoPages,
        page => page.path.slice(0, 9) !== `template-`,
      )

      // Convert to our path format.
      autoPages = autoPages.map(page => ({
        ...page,
        path: createPath(pagesDirectory, page.component),
      }))

      // Validate pages.
      autoPages.forEach(page => {
        const { error } = Joi.validate(page, pageSchema)
        if (error) {
          console.log(chalk.blue.bgYellow(`A page object failed validation`))
          console.log(page)
          console.log(chalk.bold.red(error))
        }
      })

      resolve(autoPages)
    })
  })

module.exports = async program => {
  console.log(`lib/bootstrap/index.js time since started:`, process.uptime())
  // Set the program to the globals programDB
  programDB(program)

  // Try opening the site's gatsby-config.js file.
  console.time(`open and validate gatsby-config.js`)
  let config = {}
  try {
    config = require(`${program.directory}/gatsby-config`)
  } catch (e) {
    console.log(`Couldn't open your gatsby-config.js file`)
    console.log(e)
    process.exit()
  }

  // Add config to site object.
  let normalizedConfig
  if (config.default) {
    normalizedConfig = config.default
    siteDB(siteDB().set(`config`, config.default))
  } else {
    normalizedConfig = config
    siteDB(siteDB().set(`config`, config))
  }

  // Validate gatsby-config.js
  const result = Joi.validate(normalizedConfig, gatsbyConfigSchema)
  if (result.error) {
    console.log(chalk.blue.bgYellow(`gatsby.config.js failed validation`))
    console.log(chalk.bold.red(result.error))
    console.log(normalizedConfig)
    process.exit()
  }
  console.timeEnd(`open and validate gatsby-config.js`)

  // Instantiate plugins.
  const plugins = []
  const processPlugin = plugin => {
    if (_.isString(plugin)) {
      const resolvedPath = path.dirname(require.resolve(plugin))
      const packageJSON = JSON.parse(
        fs.readFileSync(`${resolvedPath}/package.json`, `utf-8`),
      )
      return {
        resolve: resolvedPath,
        name: packageJSON.name,
        version: packageJSON.version,
        pluginOptions: {
          plugins: [],
        },
      }
    } else {
      // Plugins can have plugins.
      const subplugins = []
      if (plugin.options && plugin.options.plugins) {
        plugin.options.plugins.forEach(p => {
          subplugins.push(processPlugin(p))
        })
      }
      plugin.options.plugins = subplugins

      const resolvedPath = path.dirname(require.resolve(plugin.resolve))
      const packageJSON = JSON.parse(
        fs.readFileSync(`${resolvedPath}/package.json`, `utf-8`),
      )
      return {
        resolve: resolvedPath,
        name: packageJSON.name,
        version: packageJSON.version,
        pluginOptions: _.merge({ plugins: [] }, plugin.options),
      }
    }
  }

  if (normalizedConfig.plugins) {
    normalizedConfig.plugins.forEach(plugin => {
      plugins.push(processPlugin(plugin))
    })
  }

  // Add the site's default "plugin" i.e. gatsby-x files in root of site.
  plugins.push({
    resolve: process.cwd(),
    name: `defaultSitePlugin`,
    version: `n/a`,
    pluginOptions: {
      plugins: [],
    },
  })

  // Create a "flattened" array of plugins with all subplugins brought to the top-level.
  // This simplifies running gatsby-* files for subplugins.
  const flattenedPlugins = []
  const extractPlugins = plugin => {
    plugin.pluginOptions.plugins.forEach(subPlugin => {
      flattenedPlugins.push(subPlugin)
      extractPlugins(subPlugin)
    })
  }

  plugins.forEach(plugin => {
    flattenedPlugins.push(plugin)
    extractPlugins(plugin)
  })

  siteDB(siteDB().set(`plugins`, plugins))
  siteDB(siteDB().set(`flattenedPlugins`, flattenedPlugins))

  // Ensure the public directory is created.
  await mkdirs(`${program.directory}/public`)

  // Copy our site files to the root of the site.
  console.time(`copy gatsby files`)
  const srcDir = `${__dirname}/../intermediate-representation-dir`
  const siteDir = `${program.directory}/.intermediate-representation`
  try {
    //await removeDir(siteDir)
    await copy(srcDir, siteDir, { clobber: true })
    await mkdirs(`${program.directory}/.intermediate-representation/json`)
  } catch (e) {
    console.log(`Unable to copy site files to .intermediate-representation`)
    console.log(e)
  }

  // Find plugins which implement gatsby-browser and gatsby-ssr and write
  // out api-runners for them.
  const hasAPIFile = (env, plugin) =>
    glob.sync(`${plugin.resolve}/gatsby-${env}*`)[0]

  const ssrPlugins = _.filter(
    flattenedPlugins.map(plugin => ({
      resolve: hasAPIFile(`ssr`, plugin),
      options: plugin.pluginOptions,
    })),
    plugin => plugin.resolve,
  )
  const browserPlugins = _.filter(
    flattenedPlugins.map(plugin => ({
      resolve: hasAPIFile(`browser`, plugin),
      options: plugin.pluginOptions,
    })),
    plugin => plugin.resolve,
  )

  let browserAPIRunner = fs.readFileSync(
    `${siteDir}/api-runner-browser.js`,
    `utf-8`,
  )
  const browserPluginsRequires = browserPlugins
    .map(
      plugin =>
        `{
      plugin: require('${plugin.resolve}'),
      options: ${JSON.stringify(plugin.options)},
    }`,
    )
    .join(`,`)
  browserAPIRunner = `var plugins = [${browserPluginsRequires}]\n${browserAPIRunner}`

  let sSRAPIRunner = fs.readFileSync(`${siteDir}/api-runner-ssr.js`, `utf-8`)
  const ssrPluginsRequires = ssrPlugins
    .map(
      plugin =>
        `{
      plugin: require('${plugin.resolve}'),
      options: ${JSON.stringify(plugin.options)},
    }`,
    )
    .join(`,`)
  sSRAPIRunner = `var plugins = [${ssrPluginsRequires}]\n${sSRAPIRunner}`

  fs.writeFileSync(
    `${siteDir}/api-runner-browser.js`,
    browserAPIRunner,
    `utf-8`,
  )
  fs.writeFileSync(`${siteDir}/api-runner-ssr.js`, sSRAPIRunner, `utf-8`)

  console.timeEnd(`copy gatsby files`)

  // Create Schema.
  console.time(`create schema`)
  const schema = await require(`../schema/new`)()
  //const schema = await require(`../schema`)()
  const graphqlRunner = (query, context) =>
    graphql(schema, query, context, context, context)
  console.timeEnd(`create schema`)

  // TODO create new folder structure for files to reflect major systems.
  // TODO validate page objects when adding them.
  // TODO pass names of layout/page components into commons plugin for proper
  // code splitting.
  // TODO split layout components into their own files as well.
  // TODO add plugin system plus ways to use Redux + Glamor server rendering.
  // TODO layouts can specify parent layouts
  // TODO js pages + markdown can specify layouts directly.
  //
  // directory structure
  // /pages --> source plugins by default turn these files into pages.
  // /drafts --> source plugins can have a development option which would add
  //   drafts but only in dev server.
  // /layouts --> layout components e.g. blog-post.js, tag-page.js
  // /components --> this is convention only but dumping ground for react.js components
  // /data --> default json, yaml, csv, toml source plugins extract data from these.
  // /assets --> anything here is copied verbatim to /public
  // /public --> build place
  // / --> html.js, gatsby-node.js, gatsby-browser.js, gatsby-config.js

  // Collect pages.
  let pages = await apiRunnerNode(`createPages`, { graphql: graphqlRunner }, [
  ])
  pages = _.flatten(pages)

  if (_.isArray(pages) && pages.length > 0) {
    // Add chunkName.
    pages.forEach(page => {
      page.componentChunkName = layoutComponentChunkName(
        program.directory,
        page.component,
      )
    })

    // Validate pages.
    if (pages) {
      pages.forEach(page => {
        const { error } = Joi.validate(page, pageSchema)
        if (error) {
          console.log(chalk.blue.bgYellow(`A page object failed validation`))
          console.log(chalk.bold.red(error))
          console.log(`page object`)
          console.log(page)
        }
      })
    }
    console.log(`validated pages`)
  } else {
    pages = []
  }

  // Save pages to in-memory database.
  const pagesMap = new Map()
  pages.forEach(page => {
    pagesMap.set(page.path, page)
  })
  pagesDB(pagesMap)
  console.log(`added pages to in-memory db`)

  // TODO move this to own source plugin per component type
  // (js/cjsx/typescript, etc.)
  const autoPages = await autoPathCreator(program, pages)
  if (autoPages) {
    const pagesMap = new Map()
    autoPages.forEach(page => pagesMap.set(page.path, page))
    pagesDB(new Map([...pagesDB(), ...pagesMap]))
  }
  console.log(`created js pages`)

  const modifiedPages = await apiRunnerNode(
    `onPostCreatePages`,
    pagesDB(),
    pagesDB(),
  )

  // Validate pages.
  modifiedPages.forEach(page => {
    const { error } = Joi.validate(page, pageSchema)
    if (error) {
      console.log(chalk.blue.bgYellow(`A page object failed validation`))
      console.log(chalk.bold.red(error))
      console.log(`page object`)
      console.log(page)
    }
  })
  console.log(`validated modified pages`)

  //console.log(`bootstrap finished, time since started:`, process.uptime())
  //cb(null, schema)

  await queryRunner(program, graphqlRunner)
  await apiRunnerNode(`generateSideEffects`)
  console.log(`bootstrap finished, time since started: ${process.uptime()}`)

  return { schema, graphqlRunner }
}
