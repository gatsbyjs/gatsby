const React = require(`react`)
const ThemeProvider = require(`react-jss`).ThemeProvider

// remove the JSS style tag generated on the server to avoid conflicts with the one added on the client
exports.onInitialClientRender = () => {
  const ssStyles = window.document.getElementById(`server-side-jss`)
  if (ssStyles) {
    ssStyles.parentNode.removeChild(ssStyles)
  }
}
// eslint-disable-next-line react/prop-types
exports.wrapRootElement = ({ element }, options) => {
  const theme = options.theme || {}
  return <ThemeProvider theme={theme}>{element}</ThemeProvider>
}
