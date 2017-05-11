require(`./pages-writer`)
const { watch } = require(`./query-watcher`)
const isInitialPageQueryingDone = require(`./page-query-runner`)

module.exports = {
  watch,
  isInitialPageQueryingDone,
}
