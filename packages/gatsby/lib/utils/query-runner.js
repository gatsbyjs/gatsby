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
import slash from "slash"
import { pagesDB, siteDB, programDB } from "./globals"
import { layoutComponentChunkName, pathChunkName } from "./js-chunk-names"

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
  const directory = programDB().directory
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
      programDB().directory,
      page.component
    )
    let pathStr = ``
    if (!noPath) {
      if (programDB().prefixLinks) {
        pathStr = `path:'${_.get(siteDB().get(`config`), `linkPrefix`, ``)}${page.path}',`
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
  if (glob.sync(`${programDB().directory}/layouts/default.*`).length === 0) {
    defaultLayoutExists = false
  }
  const groupedPages = _.groupBy([...pagesDB().values()], page => {
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
        component: preferDefault(require('${programDB().directory}/layouts/${layout}')),
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
        component: preferDefault(require('${programDB().directory}/layouts/${layout}')),
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
    [...pagesDB().values()],
    page => page.path.indexOf("/404") !== -1
  )

  if (notFoundPage) {
    const notFoundPageStr = `
      {
        path: "*",
        component: preferDefault(require('${programDB().directory}/layouts/default')),
        indexRoute: {
          component: preferDefault(require('${notFoundPage.component}')),
        },
      },
    `
    const pathName = pathChunkName(notFoundPage.path)
    const layoutName = layoutComponentChunkName(
      programDB().directory,
      notFoundPage.component
    )
    const notFoundPageSplitStr = `
      {
        path: "*",
        component: preferDefault(require('${programDB().directory}/layouts/default')),
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
  const componentsStr = [...pagesDB().values()]
    .map(
      page =>
        `class ${page.internalComponentName} extends React.Component {
          render () {
            const Component = preferDefault(require('${page.component}'))
            const data = require('./json/${page.jsonName}')
            return <Component {...this.props} {...data} />
          }
        }`
    )
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
    let fileStr = fs.readFileSync(file, `utf-8`)
    let ast
    // Preprocess and attempt to parse source; return an AST if we can, log an error if we can't.
    // I'm unconvinced that this is an especially good implementation...
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
    const absFile = slash(path.resolve(file));
    // Get paths for this file.
    const paths = []
    pagesDB().forEach((value, key) => {
      if (value.component === absFile) {
        paths.push(value)
      }
    })
    console.log(`running queries for ${paths.length} paths for ${file}`)
    const pathsInfo = {
      componentPath: absFile,
      directory,
      paths,
      graphql,
    }

    const handleResult = (pathInfo, result = {}) => {
      // Combine the result with the path context.
      result.pathContext = pathInfo.context
      const clonedResult = { ...result }
      result.pathContext = pathInfo

      // Add result to page object.
      const page = pagesDB().get(pathInfo.path)
      let jsonName = `${_.kebabCase(pathInfo.path)}.json`
      let internalComponentName = `Component${pascalCase(pathInfo.path)}`
      if (jsonName === `.json`) {
        jsonName = `index.json`
        internalComponentName = `ComponentIndex`
      }
      page.jsonName = jsonName
      page.internalComponentName = internalComponentName
      pagesDB(pagesDB().set(page.path, page))

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
      console.log(`rewrote JSON for queries for ${absFile}`)
      console.timeEnd(`graphql query time`)
      // Write out new child-routes.js in the .intermediate-representation directory
      // in the root of your site.
      debouncedWriteChildRoutes()
      callback()
    })
  },
  1
)

module.exports = async (program, graphql) => {
  // Get unique array of component paths and then watch them.
  // When a component is updated, rerun queries.
  const components = _.uniq(
    [...pagesDB().values()].map(page => page.component)
  )

  let outsideResolve

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

  return new Promise(resolve => outsideResolve = resolve)
}
