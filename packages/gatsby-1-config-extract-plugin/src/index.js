import ExtractTextPlugin from "extract-text-webpack-plugin"

const extractDevelopHtml = new ExtractTextPlugin(
  extractTextFilename(`develop-html`)
)
const extractBuildHtml = new ExtractTextPlugin(
  extractTextFilename(`build-html`),
  {
    allChunks: true,
  }
)
const extractBuildCss = new ExtractTextPlugin(
  extractTextFilename(`build-css`),
  { allChunks: true }
)
const extractBuildJavascript = new ExtractTextPlugin(
  extractTextFilename(`build-javascript`),
  {
    allChunks: true,
  }
)

const errorMsg = `
gatsby-1-config-extract-plugin:
  stage must be one of: "develop-html", "build-html", "build-css", "build-javascript".
  Note that the "develop" stage does not use extract-text-webpack-plugin.
`

function extractTextFilename(stage) {
  switch (stage) {
    case `develop-html`:
    case `build-html`:
      return `build-html-styles.css`
    case `build-css`:
      return `styles.css`
    case `build-javascript`:
      return `build-js-styles.css`
    default:
      throw Error(errorMsg)
  }
}

function extractTextPlugin(stage) {
  switch (stage) {
    case `develop-html`:
      return extractDevelopHtml
    case `build-html`:
      return extractBuildHtml
    case `build-css`:
      return extractBuildCss
    case `build-javascript`:
      return extractBuildJavascript
    default:
      throw Error(errorMsg)
  }
}

exports.extractTextPlugin = extractTextPlugin
exports.extractTextFilename = extractTextFilename
