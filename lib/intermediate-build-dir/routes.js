import React from 'react'
import ReactDOM from 'react-dom'
import { applyRouterMiddleware, Router, browserHistory } from 'react-router'
import useScroll from 'react-router-scroll/lib/useScroll'

const rootElement = document.getElementById('react-mount')

function renderApp() {
  const childRoutes = require('./child-routes')
  const rootRoute = {
    childRoutes: childRoutes,
  }

  ReactDOM.render((
    <Router
      history={browserHistory}
      routes={rootRoute}
      render={applyRouterMiddleware(useScroll())}
    />
  ), rootElement)
}

renderApp()

if (module.hot) {
  module.hot.accept('./child-routes', () => {
    setTimeout(() => {
      ReactDOM.unmountComponentAtNode(rootElement)
      renderApp()
    })
  })
}


