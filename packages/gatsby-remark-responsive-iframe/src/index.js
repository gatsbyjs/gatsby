const visit = require(`unist-util-visit`)
const cheerio = require(`cheerio`)
const Promise = require(`bluebird`)
const _ = require(`lodash`)

const isPixelNumber = n => /\d+px$/.test(n)

const isUnitlessNumber = n => {
  const nToNum = _.toNumber(n)
  return _.isFinite(nToNum)
}

const isUnitlessOrPixelNumber = n =>
  n && (isUnitlessNumber(n) || isPixelNumber(n))

// Aspect ratio can only be determined if both width and height are unitless or
// pixel values. Any other values mean the responsive wrapper is not applied.
const acceptedDimensions = (width, height) =>
  isUnitlessOrPixelNumber(width) && isUnitlessOrPixelNumber(height)

module.exports = ({ markdownAST }, pluginOptions = {}) =>
  new Promise(resolve => {
    const defaults = {
      wrapperStyle: ``,
    }
    const options = _.defaults(pluginOptions, defaults)
    visit(markdownAST, `html`, node => {
      const $ = cheerio.load(node.value)
      const iframe = $(`iframe, object`)
      if (iframe.length) {
        const width = iframe.attr(`width`)
        const height = iframe.attr(`height`)

        if (acceptedDimensions(width, height)) {
          $(`iframe, object`).attr(
            `style`,
            `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          `
          )
          $(`iframe, object`)
            .attr(`width`, null)
            .attr(`height`, null)
          const newIframe = $(`body`).html() // fix for cheerio v1

          // TODO add youtube preview image as background-image.

          const rawHTML = `
          <div
            class="gatsby-resp-iframe-wrapper"
            style="padding-bottom: ${height /
              width *
              100}%; position: relative; height: 0; overflow: hidden;${
            options.wrapperStyle
          }"
          >
            ${newIframe}
          </div>
          `

          node.data = {
            hChildren: [{ type: `raw`, value: rawHTML }],
          }
          // Set type to unknown so mdast-util-to-hast will treat this node as a
          // div not an iframe — it gets quite confused otherwise.
          node.type = `unknown`

          // Also apparently, for html node types, you have to delete the value
          // in order for mdast-util-to-hast to use hChildren. If even if
          // you change the node type to unknown...
          delete node.value
        }
      }
    })

    return resolve(markdownAST)
  })
