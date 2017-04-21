const _ = require("lodash")
const glob = require("glob")
const parseFilepath = require("parse-filepath")
const fs = require("fs")

const { store } = require("../redux/")
import {
  layoutComponentChunkName,
  pathChunkName,
} from "../utils/js-chunk-names"

// Write out routes file.
// Loop through all paths and write them out to child-routes.js
const writeChildRoutes = () => {
  const { program, config, pages } = store.getState()
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
      program.directory,
      page.component
    )
    let pathStr = ``
    if (!noPath) {
      if (program.prefixLinks) {
        pathStr = `path:'${_.get(config, `linkPrefix`, ``)}${page.path}',`
      } else {
        pathStr = `path:'${page.path}',`
      }
    }

    return `
      { ${pathStr}
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
  if (glob.sync(`${program.directory}/src/layouts/default.*`).length === 0) {
    defaultLayoutExists = false
  }
  const groupedPages = _.groupBy(pages, page => {
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
      indexPage = pages.find(
        page => parseFilepath(page.component).name === `index`
      )

      // If there's not an index page, just pick the one with the shortest path.
      // Probably a bad heuristic.
      if (!indexPage) {
        indexPage = _.first(_.sortBy(pages, page => page.path.length))
      }
      let route = `
      {
        path: '${indexPage.path}',
        component: preferDefault(require('${program.directory}/src/layouts/${layout}')),
        indexRoute: ${genChildRoute(indexPage, true)}
        childRoutes: [
      `
      let pathStr
      if (program.prefixLinks) {
        pathStr = `path:'${_.get(config, `linkPrefix`, ``)}${indexPage.path}',`
      } else {
        pathStr = `path:'${indexPage.path}',`
      }
      let splitRoute = `
      {
        ${pathStr}
        component: preferDefault(require('${program.directory}/src/layouts/${layout}')),
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
  const notFoundPage = pages.find(page => page.path.indexOf("/404") !== -1)

  if (notFoundPage) {
    const defaultLayout = `preferDefault(require('${program.directory}/src/layouts/default'))`
    const notFoundPageStr = `
      {
        path: "*",
        component: ${defaultLayout},
        indexRoute: {
          component: preferDefault(require('${notFoundPage.component}')),
        },
      },
    `
    const pathName = pathChunkName(notFoundPage.path)
    const layoutName = layoutComponentChunkName(
      program.directory,
      notFoundPage.component
    )
    const notFoundPageSplitStr = `
      {
        path: "*",
        component: ${defaultLayout},
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
  const componentsStr = pages
    .map(page => {
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
  fs.writeFileSync(`${program.directory}/.cache/child-routes.js`, childRoutes)
  fs.writeFileSync(
    `${program.directory}/.cache/split-child-routes.js`,
    splitChildRoutes
  )
}

let writtenOnce = false
let oldPages
const writeRoutes = _.debounce(() => {
  if (!writtenOnce || !_.isEqual(oldPages, store.getState().pages)) {
    writeChildRoutes()
    writtenOnce = true
    oldPages = store.getState().pages
  }
}, 250)

store.subscribe(() => {
  if (store.getState().lastAction.type === `UPSERT_PAGE`) {
    writeRoutes()
  }
})
