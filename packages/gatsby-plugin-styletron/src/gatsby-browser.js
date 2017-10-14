const React = require(`react`)
const Styletron = require(`styletron-client`)
const { StyletronProvider } = require(`styletron-react`)

const styletron = new Styletron()

exports.wrapRootComponent = ({ Root }) => () => (
  <StyletronProvider styletron={styletron}>
    <Root />
  </StyletronProvider>
)
