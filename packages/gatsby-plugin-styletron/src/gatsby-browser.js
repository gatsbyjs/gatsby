const React = require(`react`)
const Styletron = require(`styletron-engine-atomic`).Client
const StyletronProvider = require(`styletron-react`).Provider

exports.wrapRootComponent = ({ Root }, options) => () => {
  const styleElements = document.getElementsByClassName(`_styletron_hydrate_`)
  const styletron = new Styletron(styleElements, options)
  return (
    <StyletronProvider value={styletron}>
      <Root />
    </StyletronProvider>
  )
}
