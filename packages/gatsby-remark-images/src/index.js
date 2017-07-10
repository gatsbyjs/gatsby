const select = require(`unist-util-select`)
const path = require(`path`)
const isRelativeUrl = require(`is-relative-url`)
const _ = require(`lodash`)
const { responsiveSizes } = require(`gatsby-plugin-sharp`)
const Promise = require(`bluebird`)
const $ = require(`cheerio`)

// If the image is relative (not hosted elsewhere)
// 1. Find the image file
// 2. Find the image's size
// 3. Filter out any responsive image sizes that are greater than the image's width
// 4. Create the responsive images.
// 5. Set the html w/ aspect ratio helper.
module.exports = (
  { files, markdownNode, markdownAST, pathPrefix, getNode },
  pluginOptions
) => {
  const defaults = {
    maxWidth: 650,
    wrapperStyle: ``,
    backgroundColor: `white`,
    linkImages: true,
  }

  const options = _.defaults(pluginOptions, defaults)

  // This will only work for markdown syntax image tags
  const imageNodes = select(markdownAST, `image`)

  // This will also allow the use of html image tags
  const rawHtmlImageNodes = select(markdownAST, `html`).filter(node =>
    node.value.startsWith(`<img`)
  )

  for (let node of rawHtmlImageNodes) {
    let formattedImgTag = Object.assign(
      node,
      $.parseHTML(node.value)[0].attribs
    )
    formattedImgTag.url = formattedImgTag.src
    formattedImgTag.type = `image`
    formattedImgTag.position = node.position

    imageNodes.push(formattedImgTag)
  }

  return Promise.all(
    imageNodes.map(
      node =>
        new Promise((resolve, reject) => {
          const fileType = node.url.slice(-3)

          // Ignore gifs as we can't process them,
          // svgs as they are already responsive by definition
          if (
            isRelativeUrl(node.url) &&
            fileType !== `gif` &&
            fileType !== `svg`
          ) {
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
              // console.log("responsiveSizesResult", responsiveSizesResult)
              // Calculate the paddingBottom %
              const ratio = `${1 / responsiveSizesResult.aspectRatio * 100}%`

              const originalImg = responsiveSizesResult.originalImage
              const fallbackSrc = responsiveSizesResult.src
              const srcSet = responsiveSizesResult.srcSet

              // Generate default alt tag
              const srcSplit = node.url.split("/");
              const fileName = srcSplit[srcSplit.length - 1];
              const fileNameNoExt = fileName.replace(/\.[^/.]+$/, "")
              const defaultAlt = fileNameNoExt.replace(/[^A-Z0-9]/ig, " ");

              // TODO
              // add support for sub-plugins having a gatsby-node.js so can add a
              // bit of js/css to add blurry fade-in.
              // https://www.perpetual-beta.org/weblog/silky-smooth-image-loading.html
              
              // Construct new image node w/ aspect ratio placeholder
              let rawHTML = `
          <span
            class="gatsby-resp-image-wrapper"
            style="position: relative; z-index: -1; display: block; ${options.wrapperStyle}"
          >
            <span
              class="gatsby-resp-image-background-image"
              style="padding-bottom: ${ratio};position: relative; width: 100%; bottom: 0; left: 0; background-image: url('${responsiveSizesResult.base64}'); background-size: cover; display: block;"
            >
              <img
                class="gatsby-resp-image-image"
                style="width: 100%; margin: 0; vertical-align: middle; position: absolute; top: 0; left: 0; box-shadow: inset 0px 0px 0px 400px ${options.backgroundColor};"
                alt="${node.alt ? node.alt : defaultAlt}"
                title="${node.title ? node.title : ``}"
                src="${fallbackSrc}"
                srcset="${srcSet}"
                sizes="${responsiveSizesResult.sizes}"
              />
            </span>
          </span>
          `

          // Make linking to original image optional.
          if(options.linkImages) {
            rawHTML = `
          <a
            class="gatsby-resp-image-link"
            href="${originalImg}"
            style="display: block"
            target="_blank"
            rel="noopener"
          >
          ${rawHTML}
          </a>
            `;
          }

              // Replace the image node with an inline HTML node.
              node.type = `html`
              node.value = rawHTML
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
