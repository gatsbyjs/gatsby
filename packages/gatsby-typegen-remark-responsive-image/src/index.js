const select = require(`unist-util-select`)
const path = require(`path`)
const isRelativeUrl = require(`is-relative-url`)
const _ = require(`lodash`)
const { queueImageResizing, base64 } = require(`gatsby-sharp`)
//const base64 = require(`gatsby-sharp`).base64
const imageSize = require(`image-size`)
const Promise = require(`bluebird`)

// If the image is relative (not hosted elsewhere)
// 1. Find the image file
// 2. Find the image's size
// 3. Filter out any responsive image sizes that are greater than the image's width
// 4. Create the responsive images.
// 5. Set the html w/ aspect ratio helper.
module.exports = ({ files, markdownNode, markdownAST, pluginOptions }) => {
  const defaults = {
    maxWidth: 800,
    wrapperStyle: ``,
  }
  const options = _.defaults(pluginOptions, defaults)
  options.maxWidth = parseInt(options.maxWidth, 10)

  // If the users didn't set a default sizes, we'll make one.
  if (!options.sizes) {
    options.sizes = `(max-width: ${options.maxWidth}px) 100vw, {${options.maxWidth}px}`
  }

  // Create sizes (in width) for the image. If the max width of the container
  // for the rendered markdown file is 800px, the sizes would then be: 200,
  // 400, 800, 1200, 1600, 2400.
  //
  // This is enough sizes to provide close to the optimal image size for every
  // device size / screen resolution while (hopefully) not requiring too much
  // image processing time (Sharp has optimizations thankfully for creating
  // multiple sizes of the same input file)
  const sizes = []
  sizes.push(options.maxWidth/4)
  sizes.push(options.maxWidth/2)
  sizes.push(options.maxWidth)
  sizes.push(options.maxWidth*1.5)
  sizes.push(options.maxWidth*2)
  sizes.push(options.maxWidth*3)

  const imageNodes = select(markdownAST, `image`)
  return Promise.all(imageNodes.map((node) => (
    new Promise((resolve, reject) => {
      if (isRelativeUrl(node.url)) {
        const imagePath = path.join(markdownNode.parent.dirname, node.url)
        const imageNode = _.find(files, (file) => {
          if (file && file.id) {
            return file.id === imagePath
          }
          return null
        })
        if (!imageNode || !imageNode.id) {
          return resolve()
        }

        const dimensions = imageSize(imageNode.id)
        const filteredSizes = sizes.filter((size) => size < dimensions.width)

        // Add the original image to ensure the largest image possible
        // is available for odd-shaped images. Also so we can link to
        // the original image.
        filteredSizes.push(dimensions.width)

        // Sort sizes for prettiness.
        const sortedSizes = _.sortBy(filteredSizes)

        // Queue sizes for processing.
        const images = sortedSizes.map((size) => queueImageResizing({
          file: imageNode,
          args: {
            width: size,
          },
        }))

        base64({
          file: imageNode,
        }).then((base64Result) => {
          // Calculate the paddingBottom %
          const ratio = `${(1 / images[0].aspectRatio) * 100}%`

          // Find the image with the closest width to the maxWidth for our
          // fallback src.
          const originalImg = _.maxBy(images, (image) => image.width).src
          const fallbackSrc = _.minBy(images, (image) => Math.abs(options.maxWidth - image.width)).src
          const srcSet = images.map((image) => `${image.src} ${image.width}w`).join(`,`)

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
            title="original image"
            href="${originalImg}"
            style="display: block"
          >
            <div
              class="gatsby-resp-image-wrapper"
              style="position: relative; z-index: -1; ${options.wrapperStyle}"
            >
              <div
                class="gatsby-resp-image-background-image"
                style="padding-bottom: ${ratio};position: relative; width: 100%; bottom: 0; left: 0; background-image: url('${base64Result.src}'); background-size: cover;"
              >
                <img
                  class="gatsby-resp-image-image"
                  style="width: 100%; margin: 0; vertical-align: middle; position: absolute;"
                  alt="${node.alt ? node.alt : ``}"
                  title="${node.title ? node.title : ``}"
                  src="${fallbackSrc}"
                  srcset="${srcSet}"
                  sizes="${options.sizes}"
                />
              </div>
            </div>
          </a>
          `
          //const rawHTML = `
          //<div style="width: ${base64Result.width}px; height: ${base64Result.height}px;  padding-bottom: ${base64Result.aspectRatio * 100}%;" class="image-loader">
          //`

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
  )))
}
