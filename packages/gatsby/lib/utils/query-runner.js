import queue from "async/queue"
import chokidar from "chokidar"
import fs from "fs"
import _ from "lodash"
import traverse from "babel-traverse"
import path from "path"
import parseFilepath from "parse-filepath"
import glob from "glob"
import apiRunnerNode from "./api-runner-node"
import Promise from "bluebird"
const { store } = require("../redux")
const { boundActionCreators } = require("../redux/actions")
import { layoutComponentChunkName, pathChunkName } from "./js-chunk-names"
import { graphql as graphqlFunction } from "graphql"

let initialQueriesDone = false
let invalidPages = []

store.subscribe(() => {
  const state = store.getState()
  if (state.lastAction.type === "CREATE_NODE") {
    // console.log(`lastAction`, state.lastAction.payload.id)
    const node = state.nodes[state.lastAction.payload.id]
    // Find invalid pages.
    if (state.pageDataDependencies.nodes[node.id]) {
      invalidPages = invalidPages.concat(
        state.pageDataDependencies.nodes[node.id]
      )
    }
    // Find invalid connections
    if (state.pageDataDependencies.connections[node.type]) {
      invalidPages = invalidPages.concat(
        state.pageDataDependencies.connections[node.type]
      )
    }
    if (invalidPages.length > 0) {
      console.log(`all pages invalidated by node change`, invalidPages)
    }
  }
})

// Babylon has to use a require... why?
const babylon = require("babylon")

const pascalCase = _.flow(_.camelCase, _.upperFirst)

const hashStr = function(str) {
  let hash = 5381
  let i = str.length

  while (i) {
    hash = hash * 33 ^ str.charCodeAt(--i)
  }

  /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */
  return hash >>> 0
}

// Write out routes file.
// Loop through all paths and write them out to child-routes.js
const writeChildRoutes = () => {
  const directory = store.getState().program.directory
  let childRoutes = ``
  let splitChildRoutes = ``

  const genChildRoute = (page, noPath) => {
    let pathStr = ``
    if (!noPath) {
      pathStr = `path:'${page.path}',`
    }
    return `
      {
        ${pathStr}
        component: ${page.internalComponentName},
      },
    `
  }

  const genSplitChildRoute = (page, noPath = false) => {
    const pathName = pathChunkName(page.path)
    const layoutName = layoutComponentChunkName(
      store.getState().program.directory,
      page.component
    )
    let pathStr = ``
    if (!noPath) {
      if (store.getState().program.prefixLinks) {
        pathStr = `path:'${_.get(store.getState().config, `linkPrefix`, ``)}${page.path}',`
      } else {
        pathStr = `path:'${page.path}',`
      }
    }

    return `
      {
        ${pathStr}
        getComponent (nextState, cb) {
          require.ensure([], (require) => {
            const Component = preferDefault(require('${page.component}'))
            require.ensure([], (require) => {
              const data = require('./json/${page.jsonName}')
              cb(null, () => <Component {...nextState} {...data} />)
            }, '${pathName}')
          }, '${layoutName}')
        }
      },
    `
  }

  // Group pages under their layout component (if any).
  let defaultLayoutExists = true
  if (
    glob.sync(
      `${store.getState().program.directory}/layouts/default.*`
    ).length === 0
  ) {
    defaultLayoutExists = false
  }
  const groupedPages = _.groupBy(store.getState().pages, page => {
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
      pages.forEach(page => {
        route += genChildRoute(page)
        splitRoute += genSplitChildRoute(page)
      })
      route += `]},`
      splitRoute += `]},`
      rootRoute += route
      splitRootRoute += splitRoute
    } else {
      let indexPage
      indexPage = _.first(
        _.filter(pages, page => parseFilepath(page.component).name === `index`)
      )
      // If there's not an index page, just pick the one with the shortest path.
      // Probably a bad heuristic.
      if (!indexPage) {
        indexPage = _.first(_.sortBy(pages, page => page.path.length))
      }
      const otherPages = _.filter(pages, page => page.path !== indexPage.path)
      let route = `
      {
        path: '${indexPage.path}',
        component: preferDefault(require('${store.getState().program.directory}/layouts/${layout}')),
        indexRoute: ${genChildRoute(indexPage, true)}
        childRoutes: [
      `
      let pathStr
      if (store.getState().program.prefixLinks) {
        pathStr = `path:'${_.get(store.getState().config, `linkPrefix`, ``)}${indexPage.path}',`
      } else {
        pathStr = `path:'${indexPage.path}',`
      }
      let splitRoute = `
      {
        ${pathStr}
        component: preferDefault(require('${store.getState().program.directory}/layouts/${layout}')),
        indexRoute: ${genSplitChildRoute(indexPage, true)}
        childRoutes: [
      `
      pages.forEach(page => {
        route += genChildRoute(page)
        splitRoute += genSplitChildRoute(page)
      })

      route += `]},`
      splitRoute += `]},`
      rootRoute += route
      splitRootRoute += splitRoute
    }
  })

  // Add a fallback 404 route if one is defined.
  const notFoundPage = _.find(
    store.getState().pages,
    page => page.path.indexOf("/404") !== -1
  )

  if (notFoundPage) {
    const notFoundPageStr = `
      {
        path: "*",
        component: preferDefault(require('${store.getState().program.directory}/layouts/default')),
        indexRoute: {
          component: preferDefault(require('${notFoundPage.component}')),
        },
      },
    `
    const pathName = pathChunkName(notFoundPage.path)
    const layoutName = layoutComponentChunkName(
      store.getState().program.directory,
      notFoundPage.component
    )
    const notFoundPageSplitStr = `
      {
        path: "*",
        component: preferDefault(require('${store.getState().program.directory}/layouts/default')),
        indexRoute: {
          getComponent (nextState, cb) {
            require.ensure([], (require) => {
              const Component = preferDefault(require('${notFoundPage.component}'))
              require.ensure([], (require) => {
                const data = require('./json/${notFoundPage.jsonName}')
                cb(null, () => <Component {...nextState} {...data} />)
              }, '${pathName}')
            }, '${layoutName}')
          }
        },
      },
    `

    rootRoute += notFoundPageStr
    splitRootRoute += notFoundPageSplitStr
  }

  // Close out object.
  rootRoute += `]}`
  splitRootRoute += `]}`
  const componentsStr = store
    .getState()
    .pages.map(page => {
      return `class ${page.internalComponentName} extends React.Component {
          render () {
            const Component = preferDefault(require('${page.component}'))
            const data = require('./json/${page.jsonName}')
            return <Component {...this.props} {...data} />
          }
        }`
    })
    .join(`\n`)

  childRoutes = `
    import React from 'react'

    // prefer default export if available
    const preferDefault = m => m && m.default || m

    /**
     * Warning from React Router, caused by react-hot-loader.
     * The warning can be safely ignored, so filter it from the console.
     * Otherwise you'll see it every time something changes.
     * See https://github.com/gaearon/react-hot-loader/issues/298
     */
    if (module.hot) {
        const isString = require('lodash/isString')

      const orgError = console.error;
      console.error = (...args) => {
      if (args && args.length === 1 && isString(args[0]) && args[0].indexOf('You cannot change <Router routes>;') > -1) {
        // React route changed
      } else {
        // Log the error as normally
        orgError.apply(console, args);
      }
      };
    }

    ${componentsStr}
    const rootRoute = ${rootRoute}
    module.exports = rootRoute`
  splitChildRoutes = `
    import React from 'react'

    // prefer default export if available
    const preferDefault = m => m && m.default || m
    const rootRoute = ${splitRootRoute}
    module.exports = rootRoute`
  fs.writeFileSync(
    `${directory}/.intermediate-representation/child-routes.js`,
    childRoutes
  )
  fs.writeFileSync(
    `${directory}/.intermediate-representation/split-child-routes.js`,
    splitChildRoutes
  )
}
const debouncedWriteChildRoutes = _.debounce(writeChildRoutes, 250)

// Queue for processing files
const q = queue(
  async ({ file, graphql, directory }, callback) => {
    const absolutePath = path.resolve(file)

    // Get paths for this file.
    let paths = []
    store.getState().pages.forEach(page => {
      if (page.component === absolutePath) {
        paths.push(page)
      }
    })

    // If we're running queries because of a source node change,
    // filter out pages that we're invalidated.
    if (invalidPages && invalidPages.length > 0) {
      paths = _.filter(paths, p => _.includes(invalidPages, p.path))
      if (paths.length > 0) {
        console.log("filtered paths", paths.map(p => p.path))
      }
    }

    // If there's no paths, just return.
    if (paths.length === 0) {
      console.log(`no queries to run for ${absolutePath}`)
      return callback()
    }

    let fileStr = fs.readFileSync(file, `utf-8`)
    let ast
    // Preprocess and attempt to parse source; return an AST if we can, log an
    // error if we can't.
    const transpiled = await apiRunnerNode(`preprocessSource`, {
      filename: file,
      contents: fileStr,
    })
    if (transpiled.length) {
      for (const item of transpiled) {
        try {
          const tmp = babylon.parse(item, {
            sourceType: `module`,
            plugins: [`*`],
          })
          ast = tmp
          break
        } catch (e) {
          console.info(e)
          continue
        }
      }
      if (ast === undefined) {
        console.error(`Failed to parse preprocessed file ${file}`)
      }
    } else {
      try {
        ast = babylon.parse(fileStr, {
          sourceType: `module`,
          sourceFilename: true,
          plugins: [`*`],
        })
      } catch (e) {
        console.log(`Failed to parse ${file}`)
        console.log(e)
      }
    }

    // Get query for this file.
    let query
    traverse(ast, {
      ExportNamedDeclaration(path, state) {
        // cache declaration node
        const declaration = path.node.declaration.declarations[0]
        // we're looking for a ES6 named export called "pageQuery"
        const name = declaration.id.name
        if (name === `pageQuery`) {
          const type = declaration.init.type
          if (type === `TemplateLiteral`) {
            // most pageQueries will be template strings
            const chunks = []
            for (const quasi of declaration.init.quasis) {
              chunks.push(quasi.value.cooked)
            }
            query = chunks.join(``)
          } else if (type === `StringLiteral`) {
            // fun fact: CoffeeScript can only generate StringLiterals
            query = declaration.init.extra.rawValue
          }
          console.time(`graphql query time`)
        } else
          return
      },
    })

    console.log(`running queries for ${paths.length} paths for ${file}`)
    const pathsInfo = {
      componentPath: absolutePath,
      directory,
      paths,
      graphql,
    }

    // Handle the result of the GraphQL query.
    const handleResult = (pathInfo, result = {}) => {
      // Combine the result with the path context.
      result.pathContext = pathInfo.context
      const clonedResult = { ...result }
      result.pathContext = pathInfo

      // Add result to page object.
      const page = store.getState().pages.find(p => p.path === pathInfo.path)
      let jsonName = `${_.kebabCase(pathInfo.path)}.json`
      let internalComponentName = `Component${pascalCase(pathInfo.path)}`
      if (jsonName === `.json`) {
        jsonName = `index.json`
        internalComponentName = `ComponentIndex`
      }
      page.jsonName = jsonName
      page.internalComponentName = internalComponentName
      boundActionCreators.upsertPage(page)

      // Save result to file.
      const resultJSON = JSON.stringify(clonedResult, null, 4)
      fs.writeFileSync(
        `${directory}/.intermediate-representation/json/${jsonName}`,
        resultJSON
      )

      return null
    }

    // Run queries for each page component.
    console.time(`graphql query time`)
    Promise.all(
      paths.map(pathInfo => {
        let pathContext
        // Mixin the path context to the top-level.
        // TODO do runtime check that user not passing in key that conflicts
        // w/ top-level keys e.g. path or component.
        if (pathInfo.context) {
          pathContext = { ...pathInfo, ...pathInfo.context }
        } else {
          pathContext = { ...pathInfo }
        }

        return graphql(query, pathContext)
          .catch(() => handleResult(pathInfo))
          .then(result => handleResult(pathInfo, result))
      })
    ).then(() => {
      console.log(`rewrote JSON for queries for ${absolutePath}`)
      console.timeEnd(`graphql query time`)
      // Write out new child-routes.js in the .intermediate-representation directory
      // in the root of your site.
      debouncedWriteChildRoutes()
      callback()
    })
  },
  1
)

module.exports = async () => {
  const schema = store.getState().schema
  const graphql = (query, context) => {
    return graphqlFunction(schema, query, context, context, context)
  }
  const { program } = store.getState()

  // Get unique array of component paths and then watch them.
  // When a component is updated, rerun queries.
  const components = _.uniq(store.getState().pages.map(page => page.component))

  let outsideResolve
  const returnPromise = new Promise(resolve => outsideResolve = resolve)

  // If there's no components yet, call the resolve early.
  if (components.length === 0) {
    outsideResolve()
  } else {
    q.drain = () => {
      // Only call resolve once.
      q.drain = _.noop
      outsideResolve()
    }
  }

  components.forEach(path => {
    q.push({ file: path, graphql, directory: program.directory })
  })

  // When not building, also start the watcher to detect when the components
  // change.
  if (_.last(program.parent.rawArgs) !== `build`) {
    const watcher = chokidar.watch(components, {
      //var watcher = chokidar.watch('/Users/kylemathews/programs/blog/pages/*.js', {
      ignored: /[\/\\]\./,
      persistent: true,
    })

    watcher
      .on(`add`, path =>
        q.push({ file: path, graphql, directory: program.directory }))
      .on(`change`, path =>
        q.push({ file: path, graphql, directory: program.directory }))
      .on(`unlink`, path =>
        q.push({ file: path, graphql, directory: program.directory }))
  }

  return returnPromise
}
