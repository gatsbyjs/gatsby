/**
 * This file should remain as JS because the migration to TypeScript break the patch.
 * For more details, https://github.com/gatsbyjs/gatsby/pull/22280
 */
const originalFetch = global.fetch
delete global.fetch

module.exports = require(`react-hot-loader/webpack`)

global.fetch = originalFetch
