const React = require(`react`)
const styletron = require(`./index`)
const { Provider } = require(`styletron-react`)

// eslint-disable-next-line react/prop-types
exports.wrapRootComponent = ({ component }, options) => {
  return <Provider value={styletron(options).instance}>{component}</Provider>
}
