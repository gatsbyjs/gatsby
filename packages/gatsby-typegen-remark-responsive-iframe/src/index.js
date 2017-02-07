const visit = require(`unist-util-visit`)
const cheerio = require(`cheerio`)
const Promise = require(`bluebird`)
const _ = require(`lodash`)

module.exports = ({ markdownAST, pluginOptions = {} }) => (
  new Promise((resolve) => {
    const defaults = {
      wrapperStyle: ``,
    }
    const options = _.defaults(pluginOptions, defaults)
    visit(markdownAST, `html`, (node) => {
      const $ = cheerio.load(node.value)
      const iframe = $(`iframe, object`)
      if (iframe) {
        const width = iframe.attr(`width`)
        const height = iframe.attr(`height`)
        const src = iframe.attr(`src`)
        if (width && height) {
          $(`iframe, object`).attr(`style`, `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          `)
          $(`iframe, object`).attr(`width`, null).attr(`height`, null)
          const newIframe = $.html()

          // TODO add youtube preview image as background-image.

          const rawHTML = `
          <div
            class="gatsby-resp-iframe-wrapper"
            style="padding-bottom: ${(height/width)*100}%; position: relative; height: 0; overflow: hidden;${options.wrapperStyle}"
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

    return resolve()
  })
)
