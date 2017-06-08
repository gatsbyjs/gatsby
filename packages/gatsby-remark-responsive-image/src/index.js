const select = require(`unist-util-select`)
const path = require(`path`)
const isRelativeUrl = require(`is-relative-url`)
const _ = require(`lodash`)
const { responsiveSizes } = require(`gatsby-plugin-sharp`)
const Promise = require(`bluebird`)

// If the image is relative (not hosted elsewhere)
// 1. Find the image file
// 2. Find the image's size
// 3. Filter out any responsive image sizes that are greater than the image's width
// 4. Create the responsive images.
// 5. Set the html w/ aspect ratio helper.
module.exports = ({
  files,
  markdownNode,
  markdownAST,
  pluginOptions,
  linkPrefix,
  getNode,
}) => {
  const defaults = {
    maxWidth: 650,
    wrapperStyle: ``,
    backgroundColor: `white`,
  }
  const options = _.defaults(pluginOptions, defaults)

  const imageNodes = select(markdownAST, `image`)
  return Promise.all(
    imageNodes.map(
      node =>
        new Promise((resolve, reject) => {
          // Ignore gifs as we can't process them.
          if (isRelativeUrl(node.url) && node.url.slice(-3) !== `gif`) {
            const imagePath = path.posix.join(
              getNode(markdownNode.parent).dir,
              node.url
            )
            const imageNode = _.find(files, file => {
              if (file && file.absolutePath) {
                return file.absolutePath === imagePath
              }
              return null
            })
            if (!imageNode || !imageNode.absolutePath) {
              return resolve()
            }

            responsiveSizes({
              file: imageNode,
              args: options,
            }).then(responsiveSizesResult => {
              // Calculate the paddingBottom %
              const ratio = `${1 / responsiveSizesResult.aspectRatio * 100}%`

              const originalImg = responsiveSizesResult.originalImage
              const fallbackSrc = responsiveSizesResult.src
              const srcSet = responsiveSizesResult.srcSet

              // TODO
              // add support for sub-plugins having a gatsby-node.js so can add a
              // bit of js/css to add blurry fade-in.
              // https://www.perpetual-beta.org/weblog/silky-smooth-image-loading.html
              //
              // TODO make linking to original image optional.

              // Construct new image node w/ aspect ratio placeholder
              const rawHTML = `
          <a
            class="gatsby-resp-image-link"
            href="${originalImg}"
            style="display: block"
            target="_blank"
          >
            <div
              class="gatsby-resp-image-wrapper"
              style="position: relative; z-index: -1; ${options.wrapperStyle}"
            >
              <div
                class="gatsby-resp-image-background-image"
                style="padding-bottom: ${ratio};position: relative; width: 100%; bottom: 0; left: 0; background-image: url('${responsiveSizesResult.src}'); background-size: cover;"
              >
                <img
                  class="gatsby-resp-image-image"
                  style="width: 100%; margin: 0; vertical-align: middle; position: absolute; box-shadow: inset 0px 0px 0px 400px ${options.backgroundColor};"
                  alt="${node.alt ? node.alt : ``}"
                  title="${node.title ? node.title : ``}"
                  src="${fallbackSrc}"
                  srcset="${srcSet}"
                  sizes="${responsiveSizesResult.sizes}"
                />
              </div>
            </div>
          </a>
          `
              // const rawHTML = `
              // <div style="width: ${responsiveSizesResult.width}px; height: ${responsiveSizesResult.height}px;  padding-bottom: ${responsiveSizesResult.aspectRatio * 100}%;" class="image-loader">
              // `

              node.data = {
                hChildren: [{ type: `raw`, value: rawHTML }],
              }
              // Set type to unknown so mdast-util-to-hast will treat this node as a
              // div not an image — it gets quite confused otherwise and tries to put
              // the raw html above as a child of the image which browsers
              // justifiably squawk at.
              node.type = `unknown`
              return resolve()
            })
          } else {
            // Image isn't relative so there's nothing for us to do.
            return resolve()
          }
        })
    )
  )
}
