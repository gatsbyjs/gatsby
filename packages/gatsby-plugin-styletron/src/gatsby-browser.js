const React = require(`react`)
const styletron = require(`./index`)
const { Provider, DebugEngine } = require(`styletron-react`)

const debug = process.env.NODE_ENV === `production` ? void 0 : new DebugEngine()

// eslint-disable-next-line react/prop-types
exports.wrapRootElement = ({ element }, options) => (
  <Provider
    value={styletron(options).instance}
    debug={debug}
    debugAfterHydration
  >
    {element}
  </Provider>
)
