const visit = require(`unist-util-visit`)
const cheerio = require(`cheerio`)
const Promise = require(`bluebird`)
const { oneLine } = require(`common-tags`)
const _ = require(`lodash`)

const isPixelNumber = n => /\d+px$/.test(n)

const isUnitlessNumber = n => {
  const nToNum = _.toNumber(n)
  return _.isFinite(nToNum)
}

const isUnitlessOrPixelNumber = n =>
  n && (isUnitlessNumber(n) || isPixelNumber(n))

const needsSemicolon = str => !str.endsWith(`;`)

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
    visit(markdownAST, [`html`, `jsx`], node => {
      const $ = cheerio.load(node.value)
      const iframe = $(`iframe, object`)
      if (iframe.length) {
        const width = iframe.attr(`width`)
        const height = iframe.attr(`height`)

        if (acceptedDimensions(width, height)) {
          const existingStyle = $(`iframe`).attr(`style`) // Other plugins might set border: 0
          // so we make sure that we maintain those existing styles. If other styles like height or
          // width are already defined they will be overridden anyway.

          let fullStyle = ``
          if (existingStyle && needsSemicolon(existingStyle)) {
            fullStyle = `${existingStyle};`
          } else if (existingStyle) {
            fullStyle = existingStyle
          }

          $(`iframe, object`).attr(
            `style`,
            `${fullStyle}
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

          const rawHTML = oneLine`
          <div
            class="gatsby-resp-iframe-wrapper"
            style="padding-bottom: ${(height / width) *
              100}%; position: relative; height: 0; overflow: hidden;${
            options.wrapperStyle
          }"
          >
            ${newIframe}
          </div>
          `

          node.type = `html`
          node.value = rawHTML
        }
      }
    })

    return resolve(markdownAST)
  })
