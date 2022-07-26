const visit = require(`unist-util-visit`)
const cheerio = require(`cheerio`)
const { oneLine } = require(`common-tags`)
const _ = require(`lodash`)

const needsSemicolon = str => !str.endsWith(`;`)

/**
 * Convert anything to number, except for % value.
 * We don't have to check for other values (em, vw, etc.)
 * because the browsers will treat them as px anyway.
 * @param {*} n something to be converted to number
 * @returns {number}
 */
const convert = n =>
  typeof n === `string` && n.trim().endsWith(`%`) ? NaN : parseInt(n, 10)

/**
 * Check whether all passed in arguments are valid number or not
 * @param  {...number} args dimension to check
 * @returns {boolean}
 */
const isValidDimensions = (...args) => args.every(n => _.isFinite(n))

module.exports = async ({ markdownAST }, pluginOptions = {}) => {
  const defaults = {
    wrapperStyle: ``,
  }
  const options = _.defaults({}, pluginOptions, defaults)
  visit(markdownAST, [`html`, `jsx`], node => {
    const $ = cheerio.load(node.value)
    const iframe = $(`iframe, object`)
    if (iframe.length === 0) {
      return
    }

    const width = convert(iframe.attr(`width`))
    const height = convert(iframe.attr(`height`))
    if (!isValidDimensions(width, height)) {
      return
    }

    let fullStyle = $(`iframe`).attr(`style`) || `` // Other plugins might set border: 0
    // so we make sure that we maintain those existing styles. If other styles like height or
    // width are already defined they will be overridden anyway.

    if (fullStyle.length > 0 && needsSemicolon(fullStyle)) {
      fullStyle = `${fullStyle};`
    }

    $(`iframe, object`)
      .attr(
        `style`,
        `${fullStyle}
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      `
      )
      .attr(`width`, null)
      .attr(`height`, null)

    const newIframe = $(`body`).html() // fix for cheerio v1

    // TODO add youtube preview image as background-image.

    const rawHTML = oneLine`
      <div
        class="gatsby-resp-iframe-wrapper"
        style="padding-bottom: ${
          (height / width) * 100
        }%; position: relative; height: 0; overflow: hidden;
        ${options.wrapperStyle}"
      >
        ${newIframe}
      </div>
    `

    node.type = `html`
    node.value = rawHTML
  })

  return markdownAST
}
