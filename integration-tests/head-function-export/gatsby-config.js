const {
  data: headFunctionExportData,
} = require(`./shared-data/head-function-export.js`)

module.exports = {
  siteMetadata: {
    title: "head-function-export",
    headFunctionExport: headFunctionExportData.queried,
  },
  plugins: [],
}
