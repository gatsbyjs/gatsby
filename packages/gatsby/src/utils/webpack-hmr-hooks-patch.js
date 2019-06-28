const originalFetch = global.fetch
delete global.fetch

module.exports = require(`react-hot-loader/webpack`)

global.fetch = originalFetch
