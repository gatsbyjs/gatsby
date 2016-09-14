import queue from 'async/queue'
import chokidar from 'chokidar'
const babylon = require('babylon')
import fs from 'fs'
import _ from 'lodash'
const babel = require('babel-core')
import path from 'path'
import { graphql } from 'graphql';
import parseFilepath from 'parse-filepath'

import { pagesDB, siteDB } from './globals'
import { layoutComponentChunkName, pathChunkName } from './js-chunk-names'

const hashStr = function(str) {
  var hash = 5381,
      i    = str.length

  while(i)
    hash = (hash * 33) ^ str.charCodeAt(--i)

  /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */
  return hash >>> 0;
}

const babelPlugin = function ({types: t}) {
  return {
    visitor: {
      TemplateLiteral(path, state) {
        if (path.parentPath.parentPath.parentPath.type !== "ExportNamedDeclaration") {
          return
        }
        const exportPath = path.parentPath.parentPath.parentPath
        const name = _.get(exportPath, 'node.declaration.declarations[0].id.name')
        if (name === 'routeQuery') {
          //const tag = path.get('tag')
          //console.log(path, tag)
          //console.log(tag.isIdentifier({name: 'GATSBY'}))
          //console.log(hashStr('abcdcbewq'))
          //console.log(path.node.declaration.arguments[1])
          const quasis = _.get(path, 'node.quasis', [])
          const expressions = path.get('expressions')
          let chunks = []
          quasis.forEach((quasi) => {
            chunks.push(quasi.value.cooked)
            let expr = expressions.shift()
            if (expr) {
              //console.log(expr)
              //console.log(expr.scope.bindings.ReadNext)
              chunks.push(expr.scope.bindings[expr.node.name].path.get('value').parentPath.node.init.quasis[0].value.cooked)
            }
          })
          const queryTemplate = _.template(chunks.join(''))
          //console.log('template', chunks.join(''))
          console.time('graphql query time')
          const graphql = state.opts.graphql
          _.each(state.opts.paths, (pathInfo) => {
            const query = queryTemplate({ ...pathInfo })
            const queryHash = hashStr(query)

            // Add query/queryHash to route object.
            const route = pagesDB().get(pathInfo.path)
            route.query = query
            route.queryHash = queryHash
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
            .catch(error => console.log('graphql error', error))
            .then(result => {
              // Combine the result with the pathInfo.
              result.pathContext = pathInfo

              // Add result to path object.
              route.data = result

              // Remove Loki metadata
              result = _.clone(result)
              delete result.pathContext.meta
              delete result.pathContext['$loki']

              // Save result to file.
              const resultJSON = JSON.stringify(result, null, 4)
              let fileName = `${_.kebabCase(pathInfo.path)}.js`
              if (fileName === ".js") {
                fileName = "index.js"
              }
              fs.writeFileSync(`${state.opts.directory}/.intermediate-build/json/${queryHash}.json`, resultJSON)
            })
          })
          console.log(`rewrote HOC, JSON for ${state.opts.componentPath}`)
          console.timeEnd('graphql query time')

          //path.parentPath.replaceWithSourceString(`require('fixme.json')`);
        }
      }
    }
  }
}

// Queue for processing files
const q = queue(({ file, graphql, directory }, callback) => {
  const fileStr = fs.readFileSync(file, 'utf-8')
  const ast = babylon.parse(fileStr, {
    sourceType: 'module',
    sourceFilename: true,
    plugins: [
      'asyncFunctions',
      'jsx',
      'flow',
      'objectRestSpread',
    ],
  })
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

  babel.transformFromAst(ast, "", {
    plugins: [[babelPlugin, { ...pathsInfo }]],
  })

  // Write out routes file.
  // Loop through all paths and write them out to child-routes.js
  let childRoutes = ""
  let splitChildRoutes = ""
  pagesDB().forEach((pathInfo) => {
    const route = pagesDB().get(pathInfo.path)
    childRoutes += `
    {
      path:'${route.path}',
      getComponent (nextState, cb) {
        const Component = require('${route.component}').default
        const data = require('./json/${route.queryHash}.json')
        cb(null, () => <Component {...nextState} {...data} />)
      }
    },
    `
    const pathName = pathChunkName(route.path)
    const layoutName = layoutComponentChunkName(route.component)
    // TODO auto add prefixed links to path only if program says to.
    // and perhaps only write out this file if building.
    splitChildRoutes += `
    {
      path:'${_.get(siteDB(), 'config.linkPrefix', '')}${route.path}',
      getComponent (nextState, cb) {
        const load = require("bundle?name=${layoutName}!${route.component}")
        console.log(load)
        require.ensure([], (require) => {
          load((module) => {
            console.log(module)
            const Component = module.default
            const data = require('./json/${route.queryHash}.json')
            console.log(data)
            cb(null, () => <Component {...nextState} {...data} />)
          })
        }, "${pathName}")
      },
    },
    `
  })
  childRoutes = `import React from 'react'; const childRoutes = [${childRoutes}]; module.exports = childRoutes`
  splitChildRoutes = `import React from 'react'; const childRoutes = [${splitChildRoutes}]; module.exports = childRoutes`
  fs.writeFileSync(`${directory}/.intermediate-build/child-routes.js`, childRoutes)
  fs.writeFileSync(`${directory}/.intermediate-build/split-child-routes.js`, splitChildRoutes)
  callback()
}, 2)

module.exports = (directory, graphql) => {
  // Get unique array of component paths and then watch them.
  // When a component is updated, rerun queries.
  const components = _.uniq([...pagesDB().values()].map((route) => route.component))
  var watcher = chokidar.watch(components, {
  //var watcher = chokidar.watch('/Users/kylemathews/programs/blog/pages/*.js', {
    ignored: /[\/\\]\./,
    persistent: true
  })

  watcher
  .on('add', path => q.push({ file: path, graphql, directory }))
  .on('change', path => q.push({ file: path, graphql, directory }))
  .on('unlink', path => q.push({ file: path, graphql, directory }))
}
