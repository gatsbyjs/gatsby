const React = require(`react`)
const StyletronProvider = require(`styletron-react`).Provider

exports.wrapRootComponent = ({ Root }, options) => () => {
  const StyletronContext = require(`./StyletronContext.js`)(options)
  return (
    <StyletronContext.Consumer>
      {value => (
        <StyletronProvider value={value}>
          <Root />
        </StyletronProvider>
      )}
    </StyletronContext.Consumer>
  )
}
