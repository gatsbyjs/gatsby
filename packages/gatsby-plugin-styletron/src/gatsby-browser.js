const React = require(`react`)
const styletron = require(`./index`)
const { Provider } = require(`styletron-react`)

// eslint-disable-next-line react/prop-types
exports.wrapRootElement = ({ element }, options) => (
  <Provider value={styletron(options).instance}>{element}</Provider>
)
