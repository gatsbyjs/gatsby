/* @flow weak */
import { graphql } from 'graphql'
import Promise from 'bluebird'
import queryRunner from '../utils/query-runner'
import { pagesDB, siteDB, programDB } from '../utils/globals'
import path from 'path'
import glob from 'glob'
import _ from 'lodash'
import createPath from './create-path'
import mkdirp from 'mkdirp'
import fs from 'fs-extra'
import Joi from 'joi'
import chalk from 'chalk'
const { layoutComponentChunkName } = require(`../utils/js-chunk-names`)

const mkdirs = Promise.promisify(fs.mkdirs)
const copy = Promise.promisify(fs.copy)
const removeDir = Promise.promisify(fs.remove)

// Joi schemas
import { gatsbyConfigSchema, pageSchema } from '../joi-schemas/joi'

import apiRunnerNode from '../utils/api-runner-node'

Promise.onPossiblyUnhandledRejection((error) => {
  throw error
})
process.on(`unhandledRejection`, (error) => {
  console.error(`UNHANDLED REJECTION`, error.stack)
})

// Path creator.
// Auto-create pages.
// algorithm is glob /pages directory for js/jsx/cjsx files *not*
// underscored. Then create url w/ our path algorithm *unless* user
// takes control of that page component in gatsby-node.
const autoPathCreator = (program) => {
  return new Promise((resolve) => {
    const pagesDirectory = path.join(program.directory, `pages`)
    let autoPages = []
    glob(`${pagesDirectory}/**/?(*.js|*.jsx|*.cjsx)`, (err, files) => {
      // Create initial page objects.
      autoPages = files.map((filePath) => ({
        component: filePath,
        componentChunkName: layoutComponentChunkName(program.directory, filePath),
        path: filePath,
      }))

      // Convert path to one relative to the pages directory.
      autoPages = autoPages.map((page) => ({
        ...page,
        path: path.relative(pagesDirectory, page.path),
      }))

      // Remove pages starting with an underscore.
      autoPages = _.filter(autoPages, (page) => page.path.slice(0, 1) !== `_`)

      // Remove page templates.
      autoPages = _.filter(autoPages, (page) => !_.includes(page.path, `PAGE_TEMPLATE`))

      // Convert to our path format.
      autoPages = autoPages.map((page) => ({
        ...page,
        path: createPath(pagesDirectory, page.component),
      }))

      // Validate pages.
      autoPages.forEach((page) => {
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
}


module.exports = async (program, cb) => {
  // Set the program to the globals programDB
  programDB(program)

  // Try opening the site's gatsby-config.js file.
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

  // Copy our site files to the root of the site.
  const srcDir = `${__dirname}/../intermediate-representation-dir`
  const siteDir = `${program.directory}/.intermediate-representation`
  try {
    await removeDir(siteDir)
    await copy(srcDir, siteDir, { clobber: true })
    await mkdirs(`${program.directory}/.intermediate-representation/json`)
  } catch (e) {
    console.log(`Unable to copy site files to .intermediate-representation`)
    console.log(e)
  }

  // Create Schema.
  const schema = await require(`../utils/schema`)()
  const graphqlRunner = (query, context) => graphql(schema, query, context, context, context)

  // TODO create new folder structure for files to reflect major systems.
  // TODO validate page objects when adding them.
  // TODO validate gatsby-config.js.
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
  const pages = await apiRunnerNode(`createPages`, { graphql: graphqlRunner }, [])

  // Add chunkName.
  pages.forEach((page) => (
    page.componentChunkName = layoutComponentChunkName(program.directory, page.component)
  ))

  // Validate pages.
  if (pages) {
    pages.forEach((page) => {
      const { error } = Joi.validate(page, pageSchema)
      if (error) {
        console.log(chalk.blue.bgYellow(`A page object failed validation`))
        console.log(chalk.bold.red(error))
        console.log(`page object`)
        console.log(page)
      }
    })
  }

  // Save pages to in-memory database.
  if (pages) {
    const pagesMap = new Map()
    pages.forEach((page) => {
      pagesMap.set(page.path, page)
    })
    pagesDB(pagesMap)
  }

  // TODO move this to own source plugin per component type (js/cjsx/typescript, etc.)
  const autoPages = await autoPathCreator(program, pages)
  if (autoPages) {
    const pagesMap = new Map()
    autoPages.forEach((page) => pagesMap.set(page.path, page))
    pagesDB(new Map([...pagesDB(), ...pagesMap]))
  }

  const modifiedPages = await apiRunnerNode(`onPostCreatePages`, pagesDB(), pagesDB())

  // Validate pages.
  modifiedPages.forEach((page) => {
    const { error } = Joi.validate(page, pageSchema)
    if (error) {
      console.log(chalk.blue.bgYellow(`A page object failed validation`))
      console.log(chalk.bold.red(error))
      console.log(`page object`)
      console.log(page)
    }
  })

  queryRunner(program, graphqlRunner, () => {
    cb(null, schema)
  })
}
