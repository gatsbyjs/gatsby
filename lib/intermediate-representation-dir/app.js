import React from 'react'
import ReactDOM from 'react-dom'
import { applyRouterMiddleware, Router, browserHistory } from 'react-router'
import useScroll from 'react-router-scroll/lib/useScroll'
import { onRouteUpdate } from 'gatsby-browser'

const rootElement = document.getElementById(`react-mount`)

let currentLocation

browserHistory.listen(location => {
  currentLocation = location
})

function renderApp () {
  const rootRoute = require(`./child-routes`)

  ReactDOM.render((
    <Router
      history={browserHistory}
      routes={rootRoute}
      render={applyRouterMiddleware(useScroll())}
      onUpdate={() => {if (onRouteUpdate) { onRouteUpdate(currentLocation) }}}
    />
  ), rootElement)
}

renderApp()

if (module.hot) {
  module.hot.accept(`./child-routes`, () => {
    setTimeout(() => {
      ReactDOM.unmountComponentAtNode(rootElement)
      renderApp()
    })
  })
}

