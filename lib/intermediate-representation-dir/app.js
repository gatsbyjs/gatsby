import apiRunner from 'api-runner-browser'
// Let the site/plugins run code very early.
apiRunner('clientEntry')

import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer as HotContainer } from 'react-hot-loader'

const rootElement = document.getElementById(`react-mount`)
let Root = require('./root')
if (Root.default) { Root = Root.default }

// Let site, plugins wrap the site e.g. for Redux.
const WrappedRoot = apiRunner('wrapRootComponent', { Root: Root }, Root)
ReactDOM.render(
  <HotContainer>
    <WrappedRoot />
  </HotContainer>,
  rootElement
)

if (module.hot) {
  module.hot.accept(`./root`, () => {
    let NextRoot = require('./root')
    if (NextRoot.default) { NextRoot = NextRoot.default }
    // Let site, plugins wrap the site e.g. for Redux.
    const WrappedRoot = apiRunner('wrapRootComponent', { Root: NextRoot }, NextRoot)
    ReactDOM.render(
      <HotContainer>
        <WrappedRoot />
      </HotContainer>,
      rootElement
    )
  })
}

