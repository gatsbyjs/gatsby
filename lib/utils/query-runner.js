import queue from 'async/queue'
import chokidar from 'chokidar'
const babylon = require(`babylon`)
import fs from 'fs'
import _ from 'lodash'
const babel = require(`babel-core`)
import path from 'path'
import { graphql } from 'graphql'
import parseFilepath from 'parse-filepath'
import glob from 'glob'

import { pagesDB, siteDB, programDB } from './globals'
import { layoutComponentChunkName, pathChunkName } from './js-chunk-names'

const hashStr = function (str) {
  let hash = 5381,
    i = str.length

  while (i)
    hash = (hash * 33) ^ str.charCodeAt(--i)

  /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */
  return hash >>> 0
}

// Write out routes file.
// Loop through all paths and write them out to child-routes.js
const writeChildRoutes = () => {
  const directory = programDB().directory
  let childRoutes = ``
  let splitChildRoutes = ``

  const genChildRoute = (page, noPath) => {
    let pathStr = ``
    if (!noPath) {
      pathStr = `path:'${page.path}',`
    }
    return (`
      {
        ${pathStr}
        component: (props) => {
          const Component = require('${page.component}').default
          const data = require('./json/${page.resultHash}.json')
          return (
            <Component {...props} {...data} />
          )
        },
      },
    `)
  }

  const genSplitChildRoute = (page, noPath=false) => {
    const pathName = pathChunkName(page.path)
    const layoutName = layoutComponentChunkName(programDB().directory, page.component)
    let pathStr = ``
    if (!noPath) {
      if (programDB().prefixLinks) {
        pathStr = `path:'${_.get(siteDB().get(`config`), `linkPrefix`, ``)}${page.path}',`
      } else {
        pathStr = `path:'${page.path}',`
      }
    }

    return (`
      {
        ${pathStr}
        getComponent (nextState, cb) {
          require.ensure([], (require) => {
            let Component = require('${page.component}')
            if (Component.default) {
              Component = Component.default
            }
            require.ensure([], (require) => {
              const data = require('./json/${page.resultHash}.json')
              cb(null, () => <Component {...nextState} {...data} />)
            }, '${pathName}')
          }, '${layoutName}')
        }
      },
    `)
  }

  // Group pages under their layout component (if any).
  let defaultLayoutExists = true
  if (glob.sync(`${programDB().directory}/layouts/default.*`).length === 0) {
    defaultLayoutExists = false
  }
  const groupedPages = _.groupBy([...pagesDB().values()], (page) => {
    // If is a string we'll assume it's a working layout component.
    if (_.isString(page.layout)) {
      return page.layout
    // If the user explicitely turns off layout, put page in undefined bucket.
    } else if (page.layout === false) {
      return `undefined`
    // Otherwise assume the default layout should handle this page.
    } else if (defaultLayoutExists) {
      return `default`
    // We got nothing left, undefined.
    } else {
      return `undefined`
    }
  })
  let rootRoute = `{ childRoutes: [` // We close this out at the bottom.
  let splitRootRoute = `{ childRoutes: [` // We close this out at the bottom.
  _.forEach(groupedPages, (pages, layout) => {
    let route = `{`
    let splitRoute = `{`
    if (layout === `undefined`) {
      // If a layout isn't defined then don't provide an index route, etc.
      route += `childRoutes: [`
      splitRoute += `childRoutes: [`
      pages.forEach((page) => {
        route += genChildRoute(page)
        splitRoute += genSplitChildRoute(page)
      })
      route += `]},`
      splitRoute += `]},`
      rootRoute += route
      splitRootRoute += splitRoute
    } else {
      let indexPage
      indexPage = _.first(_.filter(pages, (page) => parseFilepath(page.component).name === `index`))
      // If there's not an index page, just pick the one with the shortest path.
      // Probably a bad heuristic.
      if (!indexPage) {
        indexPage = _.first(_.sortBy(pages, (page) => {
          return page.path.length
        }))
      }
      const otherPages = _.filter(pages, (page) => page.path !== indexPage.path)
      let route = `
      {
        path: '${indexPage.path}',
        component: require('${programDB().directory}/layouts/${layout}'),
        indexRoute: ${genChildRoute(indexPage, true)}
        childRoutes: [
      `
      let pathStr
      if (programDB().prefixLinks) {
        pathStr = `path:'${_.get(siteDB().get(`config`), `linkPrefix`, ``)}${indexPage.path}',`
      } else {
        pathStr = `path:'${indexPage.path}',`
      }
      let splitRoute = `
      {
        ${pathStr}
        component: require('${programDB().directory}/layouts/${layout}'),
        indexRoute: ${genSplitChildRoute(indexPage, true)}
        childRoutes: [
      `
      pages.forEach((page) => {
        route += genChildRoute(page)
        splitRoute += genSplitChildRoute(page)
      })
      route += `]},`
      splitRoute += `]},`
      rootRoute += route
      splitRootRoute += splitRoute
    }
  })
  // Close out object.
  rootRoute += `]}`
  splitRootRoute += `]}`

  childRoutes = `
    import React from 'react'
    const rootRoute = ${rootRoute}
    module.exports = rootRoute`
  splitChildRoutes = `
    import React from 'react'
    const rootRoute = ${splitRootRoute}
    module.exports = rootRoute`
  fs.writeFileSync(`${directory}/.intermediate-representation/child-routes.js`, childRoutes)
  fs.writeFileSync(`${directory}/.intermediate-representation/split-child-routes.js`, splitChildRoutes)
}
const debouncedWriteChildRoutes = _.debounce(writeChildRoutes, 250)

const babelPlugin = function ({ types: t }) {
  return {
    visitor: {
      TemplateLiteral (path, state) {
        if (path.parentPath.parentPath.parentPath.type !== `ExportNamedDeclaration`) {
          return
        }
        const exportPath = path.parentPath.parentPath.parentPath
        const name = _.get(exportPath, `node.declaration.declarations[0].id.name`)
        if (name === `pageQuery`) {
          const quasis = _.get(path, `node.quasis`, [])
          const expressions = path.get(`expressions`)
          const chunks = []
          quasis.forEach((quasi) => {
            chunks.push(quasi.value.cooked)
            const expr = expressions.shift()
            if (expr) {
              chunks.push(expr.scope.bindings[expr.node.name].path.get(`value`).parentPath.node.init.quasis[0].value.cooked)
            }
          })
          const query = chunks.join(``)
          console.time(`graphql query time`)
          const graphql = state.opts.graphql
          _.each(state.opts.paths, (pathInfo) => {
            // TODO
            // - routeProvider thing + auto routes if component
            //   isn't a multiple route thingy.
            // - Track which json file associated with which wrapper-component
            //   and delete old one when query changes.
            // - Track ids of nodes associated with which queries
            //   and rerun query for a specific wrapper json file
            //   when an underying file changes.
            // - Also track connections/ranges and mark their components
            //   as stale (just mark any query against connections stale if a file
            //   in that connection gets changed, so all ids in that connection.)
            // - write plugin which just exports the src component
            //   instead of the fake HOC
            // - Move all this into Gatsby (as seperate package within new Lerna
            //   structure).
            // - schema for paths/pages and other internal info. Generate searchable sitemap page in dev.
            // - Markdown schema
            //   * frontmatter — just skip deciding schema — config takes JOI schema
            //   for frontmatter though.
            //   * markdownAST
            //   * diff ways of parsing Markdown AST e.g. headings
            //   * bodyRaw
            //   * bodyHTML
            //   * timeToRead, etc. (computed/derived fields)
            //   * path — programatically alterable like now.
            //   * file info e.g. parseFilepath result.
            graphql(query, pathInfo)
            .catch(error => console.log(`graphql error`, error))
            .then(result => {
              if (result.errors) {
                console.log(`graphql errors`, result.errors)
              }
              // Combine the result with the pathInfo.
              result.pathContext = pathInfo
              // TODO see if can hash actual result not result + context
              // which would combine some modules. Probably need to just
              // insert the page context in child-routes.
              // Also make page context more explicit? E.g. should never
              // send component name to browser like we are now.
              const resultHash = hashStr(JSON.stringify(result))

              // Add result to page object.
              const page = pagesDB().get(pathInfo.path)
              page.data = result
              page.resultHash = resultHash
              pagesDB(pagesDB().set(page.path, page))

              // Save result to file.
              const resultJSON = JSON.stringify(result, null, 4)
              let fileName = `${_.kebabCase(pathInfo.path)}.js`
              if (fileName === `.js`) {
                fileName = `index.js`
              }
              fs.writeFile(`${state.opts.directory}/.intermediate-representation/json/${resultHash}.json`, resultJSON)
            })
          })
          console.log(`rewrote JSON for queries for ${state.opts.componentPath}`)
          console.timeEnd(`graphql query time`)

          //path.parentPath.replaceWithSourceString(`require('fixme.json')`);
        }
      },
    },
  }
}

// Queue for processing files
const q = queue(({ file, graphql, directory }, callback) => {
  const fileStr = fs.readFileSync(file, `utf-8`)
  let ast
  try {
    ast = babylon.parse(fileStr, {
      sourceType: `module`,
      sourceFilename: true,
      plugins: [
        `asyncFunctions`,
        `jsx`,
        `flow`,
        `objectRestSpread`,
      ],
    })
  } catch (e) {
    console.log(`Failed to parse ${file}`)
    console.log(e)
  }
  const absFile = path.resolve(file)
  // Get paths for this file.
  const paths = []
  pagesDB().forEach((value, key) => {
    if (value.component === absFile) {
      paths.push(value)
    }
  })
  const pathsInfo = {
    componentPath: absFile,
    directory,
    paths,
    graphql,
  }

  // Run queries for each page component.
  try {
    babel.transformFromAst(ast, ``, {
      plugins: [[babelPlugin, { ...pathsInfo }]],
    })
  } catch (e) {
    console.log(`Failed to run queries for ${file}`)
    console.log(e)
  }
  debouncedWriteChildRoutes()
  callback()
}, 2)

module.exports = (program, graphql, cb) => {
  // Get unique array of component paths and then watch them.
  // When a component is updated, rerun queries.
  const components = _.uniq([...pagesDB().values()].map((page) => page.component))

  q.drain = () => cb()
  // When building just process the components and return.
  if (_.last(program.parent.rawArgs) === 'build') {
    components.forEach((path) => {
      q.push({ file: path, graphql, directory: program.directory })
    })
  } else {
    const watcher = chokidar.watch(components, {
    //var watcher = chokidar.watch('/Users/kylemathews/programs/blog/pages/*.js', {
      ignored: /[\/\\]\./,
      persistent: true,
    })

    watcher
    .on(`add`, path => q.push({ file: path, graphql, directory: program.directory }))
    .on(`change`, path => q.push({ file: path, graphql, directory: program.directory }))
    .on(`unlink`, path => q.push({ file: path, graphql, directory: program.directory }))
  }
}
