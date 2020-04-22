const React = require(`react`)
const styletron = require(`./index`)
const { Provider, DebugEngine } = require(`styletron-react`)

const debug = process.env.NODE_ENV === `production` ? void 0 : new DebugEngine()

// eslint-disable-next-line react/prop-types
exports.wrapRootElement = ({ element }, options) => {
  const enableDebug =
    options.debug === true || typeof options.debug === `undefined`
  return (
    <Provider
      value={styletron(options).instance}
      debug={enableDebug ? debug : undefined}
      debugAfterHydration={enableDebug}
    >
      {element}
    </Provider>
  )
}
