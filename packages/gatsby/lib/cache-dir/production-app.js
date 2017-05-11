import apiRunner from "./api-runner-browser"
// Let the site/plugins run code very early.
apiRunner(`clientEntry`)

import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter as Router, Route, withRouter } from "react-router-dom"
import { ScrollContext } from "react-router-scroll"
import createHistory from "history/createBrowserHistory"
import routes from "./routes.json"

import requires from "./async-requires"

console.log(routes)
console.log(requires)

// Load scripts
const preferDefault = m => (m && m.default) || m
const scriptsCache = {}
const loadScriptsForPath = (path, cb = () => {}) => {
  console.log(`loading scripts for`, path)

  if (!path) {
    return cb()
  }

  if (scriptsCache[path]) {
    return cb(scriptsCache[path])
  }

  const page = routes.find(r => r.path === path)

  if (!page) {
    return cb()
  }

  console.time(`load scripts`)
  let scripts = {
    layout: false,
    component: false,
    pageData: false,
  }
  const loaded = () => {
    if (scripts.layout && scripts.component && scripts.pageData) {
      console.timeEnd(`load scripts`)
      scriptsCache[path] = scripts
      cb(scripts)
    }
  }
  requires.layouts.index(layout => {
    scripts.layout = preferDefault(layout)
    loaded()
  })
  requires.components[page.componentChunkName](component => {
    scripts.component = preferDefault(component)
    loaded()
  })
  requires.json[page.jsonName](pageData => {
    scripts.pageData = pageData
    loaded()
  })
}

const navigateTo = pathname => {
  loadScriptsForPath(pathname, () => {
    window.___history.push(pathname)
  })
}

window.___loadScriptsForPath = loadScriptsForPath
window.___navigateTo = navigateTo

const history = createHistory()
history.listen((location, action) => {
  apiRunner(`onRouteUpdate`, location, action)
})

function shouldUpdateScroll(prevRouterProps, { location: { pathname } }) {
  const results = apiRunner(`shouldUpdateScroll`, {
    prevRouterProps,
    pathname,
  })
  if (results.length > 0) {
    return results[0]
  }

  if (prevRouterProps) {
    const { location: { pathname: oldPathname } } = prevRouterProps
    if (oldPathname === pathname) {
      return false
    }
  }
  return true
}

// Load 404 page component and scripts
let notFoundScripts
loadScriptsForPath(`/404.html`, scripts => {
  notFoundScripts = scripts
})

const renderPage = props => {
  const page = routes.find(r => r.path === props.location.pathname)
  if (page) {
    return $(scriptsCache[props.location.pathname].component, {
      ...props,
      ...scriptsCache[props.location.pathname].pageData,
    })
  } else if (notFoundScripts) {
    return $(notFoundScripts.component, {
      ...props,
      ...notFoundScripts.pageData,
    })
  } else {
    return null
  }
}

const renderSite = ({ scripts, props }) => {
  return $(scripts.layout, { ...props }, renderPage(props))
}

const $ = React.createElement

loadScriptsForPath(window.location.pathname, scripts => {
  const Root = () =>
    $(
      Router,
      null,
      $(
        ScrollContext,
        { shouldUpdateScroll },
        $(withRouter(scripts.layout), {
          children: layoutProps => {
            return $(Route, {
              component: routeProps => {
                window.___history = routeProps.history
                const props = layoutProps ? layoutProps : routeProps
                return renderPage(props)
              },
            })
          },
        })
      )
    )

  const NewRoot = apiRunner(`wrapRootComponent`, { Root }, Root)[0]
  ReactDOM.render(
    <NewRoot />,
    typeof window !== `undefined`
      ? document.getElementById(`___gatsby`)
      : void 0
  )
})
