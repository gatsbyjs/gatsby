// remove the JSS style tag generated on the server to avoid conflicts with the one added on the client
exports.onInitialClientRender = () => {
  // eslint-disable-next-line no-undef
  const ssStyles = window.document.getElementById(`server-side-jss`)
  ssStyles && ssStyles.parentNode.removeChild(ssStyles)
}
