exports.onInitialClientRender = () => {
  console.warn("ReactDOM.render has executed")
  document.body.prepend(document.createTextNode(`EXECUTED!`))
}
