// Note: this doesn't check for conflicts between module exports
module.exports = {
  ...require(`./page-data`),
  ...require(`./render-html`),
}
