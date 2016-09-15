import { graphql } from 'graphql'
import Promise from 'bluebird'
import queryRunner from '../utils/query-runner'
import { pagesDB, siteDB } from '../utils/globals'
import path from 'path'
import glob from 'glob'
import _ from 'lodash'
import createPath from './create-path'
import mkdirp from 'mkdirp'
import fs from 'fs-extra'
const mkdirs = Promise.promisify(fs.mkdirs)
const copy = Promise.promisify(fs.copy)

import validateDirectoryAndFiles from './validate-directory-and-files'
import apiRunner from '../utils/api-runner'

Promise.onPossiblyUnhandledRejection(function(error){
  throw error;
});
process.on('unhandledRejection', function(error, promise) {
  console.error("UNHANDLED REJECTION", error.stack);
});

// Path creator.
// Auto-create routes.
// algorithm is glob /pages directory for js/jsx/cjsx files *not*
// underscored. Then create url w/ our path algorithm *unless* user
// takes control of that route component in gatsby-node.
const autoPathCreator = (program, pages, cb) => {
  const pagesDirectory = path.join(program.directory, 'pages')
  let autoPages = []
  glob(`${pagesDirectory}/**/?(*.js|*.jsx|*.cjsx)`, (err, files) => {
    // Create initial page objects.
    autoPages = files.map((filePath) => ({
      component: filePath,
      path: filePath,
    }))

    // Convert path to one relative to the pages directory.
    autoPages.forEach((page) => {
      page.path = path.relative(pagesDirectory, page.path)
      return page
    })

    // Remove pages starting with an underscore.
    autoPages = _.filter(autoPages, (page) => {
      return page.path.slice(0, 1) !== '_'
    })

    // Convert to our path format.
    autoPages = autoPages.map((page) => {
      page.path = createPath(pagesDirectory, page.component)
      return page
    })

    cb(null, autoPages)
  })
}


module.exports = async (program, cb) => {
  // Try opening the site's gatsby-config.js file.
  let config
  try {
    config = require(`${program.directory}/gatsby-config`)
  } catch (e) {
    console.log('Couldn\'t open your gatsby-config.js file')
    console.log(e)
    process.exit()
  }

  // Add config to site object.
  if (config.default) {
    siteDB(siteDB().set('config', config.default))
  } else {
    siteDB(siteDB().set('config', config))
  }

  // Copy our site files to the root of the site.
  const srcDir = `${__dirname}/../intermediate-build-dir`
  const siteDir = `${program.directory}/.intermediate-build`
  try {
    await copy(srcDir, siteDir, { clobber: true })
    await mkdirs(`${program.directory}/.intermediate-build/json`)
  } catch (e) {
    console.log('Unable to copy site files to .intermediate-build')
    console.log(e)
  }

  // Create Schema.
  const schema = await require('../utils/schema')(program.directory)
  const graphqlRunner = (query, context) => graphql(schema, query, context)

  // TODO move layout templates to layouts. Layouts can optionally specify
  // parent layouts.
  // Plugins supplying pages must ask for a layout in its config.
  // Pages in /pages can optionally supply a "layout" value (e.g. in frontmatter)
  // which overrides (or sets) which layout component to use.
  // Or (more often?) this is set as part of the page object in "createPages".
  // TODO remove dead code.
  // TODO use GraphQL vars.
  // TODO add plugin system plus ways to use Redux + Glamor server rendering.
  // TODO move auto-create of graphql schema to seperate utils module inside new
  // schema directory.
  // TODO validate page objects when adding them.
  // TODO validate gatsby-config.js.
  // TODO create observable module w/ site and markdown objects
  //
  // directory structure
  // /pages --> source plugins by default turn these files into pages.
  // /drafts --> source plugins can have a development option which would add drafts but only in dev server.
  // /layouts --> layout components e.g. blog-post.js, tag-page.js
  // /components --> this is convention only but dumping ground for react.js components
  // /data --> default json, yaml, csv, toml source plugins extract data from these.
  // /assets --> anything here is copied verbatim to /public
  // /public --> build place
  // / --> html.js, gatsby-node.js, gatsby-browser.js, gatsby-config.js

  // Collect pages.
  const pages = await apiRunner('createPages', { graphql: graphqlRunner })

  // Save pages to in-memory database.
  // TODO validate page objects with JOI schema.
  if (pages) {
    const pagesMap = new Map()
    pages.forEach((page) => {
      pagesMap.set(page.path, page)
    })
    pagesDB(new Map([...pagesDB(), ...pagesMap]))
  }

  // TODO move this to own source plugin per component type (js/cjsx/typescript, etc.)
  autoPathCreator(program, pages, (err, autoPages) => {
    if (autoPages) {
      const pagesMap = new Map()
      autoPages.forEach((page) => pagesMap.set(page.path, page))
      pagesDB(new Map([...pagesDB(), ...pagesMap]))
    }

    queryRunner(program.directory, graphqlRunner)
    cb(null, schema)
  })
}
