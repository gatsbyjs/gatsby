const {
  DEFAULT_OPTIONS,
  EMPTY_ALT,
  imageClass,
  imageBackgroundClass,
  imageWrapperClass,
} = require(`./constants`)
const visitWithParents = require(`unist-util-visit-parents`)
const getDefinitions = require(`mdast-util-definitions`)
const path = require(`path`)
const queryString = require(`query-string`)
const isRelativeUrl = require(`is-relative-url`)
const _ = require(`lodash`)
const { fluid, stats, traceSVG } = require(`gatsby-plugin-sharp`)
const Promise = require(`bluebird`)
const cheerio = require(`cheerio`)
const { slash } = require(`gatsby-core-utils`)
const chalk = require(`chalk`)

// Should be the same as https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-transformer-sharp/src/supported-extensions.js
const supportedExtensions = {
  jpeg: true,
  jpg: true,
  png: true,
  webp: true,
  tif: true,
  tiff: true,
  avif: true,
}

// If the image is relative (not hosted elsewhere)
// 1. Find the image file
// 2. Find the image's size
// 3. Filter out any responsive image fluid sizes that are greater than the image's width
// 4. Create the responsive images.
// 5. Set the html w/ aspect ratio helper.
module.exports = (
  {
    files,
    markdownNode,
    markdownAST,
    pathPrefix,
    getNode,
    reporter,
    cache,
    compiler,
    getRemarkFileDependency,
  },
  pluginOptions
) => {
  const options = _.defaults({}, pluginOptions, { pathPrefix }, DEFAULT_OPTIONS)

  const findParentLinks = ({ children }) =>
    children.some(
      node =>
        (node.type === `html` && !!node.value.match(/<a /)) ||
        node.type === `link`
    )

  // Get all the available definitions in the markdown tree
  const definitions = getDefinitions(markdownAST)

  // This will allow the use of html image tags
  // const rawHtmlNodes = select(markdownAST, `html`)
  const rawHtmlNodes = []
  visitWithParents(markdownAST, [`html`, `jsx`], (node, ancestors) => {
    const inLink = ancestors.some(findParentLinks)

    rawHtmlNodes.push({ node, inLink })
  })

  // This will only work for markdown syntax image tags
  const markdownImageNodes = []

  visitWithParents(
    markdownAST,
    [`image`, `imageReference`],
    (node, ancestors) => {
      const inLink = ancestors.some(findParentLinks)

      markdownImageNodes.push({ node, inLink })
    }
  )

  const getImageInfo = uri => {
    const { url, query } = queryString.parseUrl(uri)
    return {
      ext: path.extname(url).split(`.`).pop(),
      url,
      query,
    }
  }

  const getImageCaption = async (node, overWrites) => {
    const getCaptionString = () => {
      const captionOptions = Array.isArray(options.showCaptions)
        ? options.showCaptions
        : options.showCaptions === true
        ? [`title`, `alt`]
        : false

      if (captionOptions) {
        for (const option of captionOptions) {
          switch (option) {
            case `title`:
              if (node.title) {
                return node.title
              }
              break
            case `alt`:
              if (node.alt === EMPTY_ALT || overWrites.alt === EMPTY_ALT) {
                return ``
              }
              if (overWrites.alt) {
                return overWrites.alt
              }
              if (node.alt) {
                return node.alt
              }
              break
          }
        }
      }

      return ``
    }

    const captionString = getCaptionString()

    if (!options.markdownCaptions || !compiler) {
      return _.escape(captionString)
    }

    return compiler.generateHTML(await compiler.parseString(captionString))
  }

  // Takes a node and generates the needed images and then returns
  // the needed HTML replacement for the image
  const generateImagesAndUpdateNode = async function (
    node,
    resolve,
    inLink,
    overWrites = {}
  ) {
    // Check if this markdownNode has a File parent. This plugin
    // won't work if the image isn't hosted locally.
    let parentNode = getNode(markdownNode.parent)
    // check if the parent node is a File node, otherwise go up the chain and
    // search for the closest parent File node. This is necessary in case
    // you have markdown in child nodes (e.g. gatsby-plugin-json-remark).
    if (
      parentNode &&
      parentNode.internal &&
      parentNode.internal.type !== `File`
    ) {
      let tempParentNode = parentNode
      while (
        tempParentNode &&
        tempParentNode.internal &&
        tempParentNode.internal.type !== `File`
      ) {
        tempParentNode = getNode(tempParentNode.parent)
      }
      if (
        tempParentNode &&
        tempParentNode.internal &&
        tempParentNode.internal.type === `File`
      ) {
        parentNode = tempParentNode
      }
    }
    let imagePath
    if (parentNode && parentNode.dir) {
      imagePath = slash(path.join(parentNode.dir, getImageInfo(node.url).url))
    } else {
      return null
    }

    let imageNode
    if (getRemarkFileDependency) {
      imageNode = await getRemarkFileDependency({
        absolutePath: {
          eq: imagePath,
        },
      })
    } else {
      // Legacy: no context, slower version of image query
      imageNode = _.find(files, file => {
        if (file && file.absolutePath) {
          return file.absolutePath === imagePath
        }
        return null
      })
    }

    if (!imageNode || !imageNode.absolutePath) {
      return resolve()
    }

    const fluidResult = await fluid({
      file: imageNode,
      args: options,
      reporter,
      cache,
    })

    if (!fluidResult) {
      return resolve()
    }

    const originalImg = fluidResult.originalImg
    const fallbackSrc = fluidResult.src
    const srcSet = fluidResult.srcSet
    const presentationWidth = fluidResult.presentationWidth

    // Generate default alt tag
    const srcSplit = getImageInfo(node.url).url.split(`/`)
    const fileName = srcSplit[srcSplit.length - 1]
    const fileNameNoExt = fileName.replace(/\.[^/.]+$/, ``)
    const defaultAlt = fileNameNoExt.replace(/[^A-Z0-9]/gi, ` `)
    const isEmptyAlt = node.alt === EMPTY_ALT

    const alt = isEmptyAlt
      ? ``
      : _.escape(
          overWrites.alt ? overWrites.alt : node.alt ? node.alt : defaultAlt
        )

    const title = node.title ? _.escape(node.title) : ``

    const loading = options.loading

    if (![`lazy`, `eager`, `auto`].includes(loading)) {
      reporter.warn(
        reporter.stripIndent(`
        ${chalk.bold(loading)} is an invalid value for the ${chalk.bold(
          `loading`
        )} option. Please pass one of "lazy", "eager" or "auto".
      `)
      )
    }

    const decoding = options.decoding

    if (![`async`, `sync`, `auto`].includes(decoding)) {
      reporter.warn(
        reporter.stripIndent(`
        ${chalk.bold(decoding)} is an invalid value for the ${chalk.bold(
          `decoding`
        )} option. Please pass one of "async", "sync" or "auto".
      `)
      )
    }

    const imageStyle = `
      width: 100%;
      height: 100%;
      margin: 0;
      vertical-align: middle;
      position: absolute;
      top: 0;
      left: 0;`.replace(/\s*(\S+:)\s*/g, `$1`)

    // Create our base image tag
    let imageTag = `
      <img
        class="${imageClass}"
        alt="${alt}"
        title="${title}"
        src="${fallbackSrc}"
        srcset="${srcSet}"
        sizes="${fluidResult.sizes}"
        style="${imageStyle}"
        loading="${loading}"
        decoding="${decoding}"
      />
    `.trim()

    const formatConfigs = [
      {
        propertyName: `withAvif`,
        format: `AVIF`,
      },
      {
        propertyName: `withWebp`,
        format: `WEBP`,
      },
    ]

    const enabledFormatConfigs = formatConfigs.filter(
      ({ propertyName }) => options[propertyName]
    )

    if (enabledFormatConfigs.length) {
      const sourcesHtmlPromises = enabledFormatConfigs.map(
        async ({ format, propertyName }) => {
          const formatFluidResult = await fluid({
            file: imageNode,
            args: _.defaults(
              { toFormat: format },
              // override options if it's an object, otherwise just pass through defaults
              options[propertyName] === true ? {} : options[propertyName],
              options
            ),
            reporter,
          })

          if (!formatFluidResult) {
            return null
          }

          return `
            <source
              srcset="${formatFluidResult.srcSet}"
              sizes="${formatFluidResult.sizes}"
              type="${formatFluidResult.srcSetType}"
            />
          `.trim()
        }
      )

      const sourcesHtml = (await Promise.all(sourcesHtmlPromises)).filter(
        sourceHtml => sourceHtml !== null
      )

      if (!sourcesHtml.length) {
        return resolve()
      }

      imageTag = `
        <picture>
          ${sourcesHtml.join(``)}
          <source
            srcset="${srcSet}"
            sizes="${fluidResult.sizes}"
            type="${fluidResult.srcSetType}"
          />
          <img
            class="${imageClass}"
            src="${fallbackSrc}"
            alt="${alt}"
            title="${title}"
            loading="${loading}"
            decoding="${decoding}"
            style="${imageStyle}"
          />
        </picture>
      `.trim()
    }

    const placeholderImageData = fluidResult.base64

    const ratio = `${(1 / fluidResult.aspectRatio) * 100}%`

    const wrapperStyle =
      typeof options.wrapperStyle === `function`
        ? options.wrapperStyle(fluidResult)
        : options.wrapperStyle

    // Construct new image node w/ aspect ratio placeholder
    const imageCaption =
      options.showCaptions && (await getImageCaption(node, overWrites))

    let removeBgImage = false
    if (options.disableBgImageOnAlpha) {
      const imageStats = await stats({ file: imageNode, reporter })
      if (imageStats && imageStats.isTransparent) removeBgImage = true
    }
    if (options.disableBgImage) {
      removeBgImage = true
    }

    const bgImage = removeBgImage
      ? ``
      : ` background-image: url('${placeholderImageData}'); background-size: cover;`

    let rawHTML = `
  <span
    class="${imageBackgroundClass}"
    style="padding-bottom: ${ratio}; position: relative; bottom: 0; left: 0;${bgImage} display: block;"
  ></span>
  ${imageTag}
  `.trim()

    // Make linking to original image optional.
    if (!inLink && options.linkImagesToOriginal) {
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
    `.trim()
    }

    rawHTML = `
    <span
      class="${imageWrapperClass}"
      style="position: relative; display: block; margin-left: auto; margin-right: auto; max-width: ${presentationWidth}px; ${
      imageCaption ? `` : wrapperStyle
    }"
    >
      ${rawHTML}
    </span>
    `.trim()

    // Wrap in figure and use title as caption
    if (imageCaption) {
      rawHTML = `
  <figure class="gatsby-resp-image-figure" style="${wrapperStyle}">
    ${rawHTML}
    <figcaption class="gatsby-resp-image-figcaption">${imageCaption}</figcaption>
  </figure>
      `.trim()
    }

    return rawHTML
  }

  return Promise.all(
    // Simple because there is no nesting in markdown
    markdownImageNodes.map(
      ({ node, inLink }) =>
        new Promise(resolve => {
          const overWrites = {}
          let refNode
          if (
            !node.hasOwnProperty(`url`) &&
            node.hasOwnProperty(`identifier`)
          ) {
            // consider as imageReference node
            refNode = node
            node = definitions(refNode.identifier)
            // pass original alt from referencing node
            overWrites.alt = refNode.alt
            if (!node) {
              // no definition found for image reference,
              // so there's nothing for us to do.
              return resolve()
            }
          }
          const fileType = getImageInfo(node.url).ext

          // Only attempt to convert supported extensions
          if (isRelativeUrl(node.url) && supportedExtensions[fileType]) {
            return generateImagesAndUpdateNode(
              node,
              resolve,
              inLink,
              overWrites
            ).then(rawHTML => {
              if (rawHTML) {
                // Replace the image or ref node with an inline HTML node.
                if (refNode) {
                  node = refNode
                }
                node.type = `html`
                node.value = rawHTML
              }

              return resolve(node)
            })
          } else {
            // Image isn't relative so there's nothing for us to do.
            return resolve()
          }
        })
    )
  ).then(markdownImageNodes =>
    // HTML image node stuff
    Promise.all(
      // Complex because HTML nodes can contain multiple images
      rawHtmlNodes.map(
        ({ node, inLink }) =>
          // eslint-disable-next-line no-async-promise-executor
          new Promise(async (resolve, reject) => {
            if (!node.value) {
              return resolve()
            }

            const $ = cheerio.load(node.value)
            if ($(`img`).length === 0) {
              // No img tags
              return resolve()
            }

            const imageRefs = []
            $(`img`).each(function () {
              // eslint-disable-next-line @babel/no-invalid-this
              imageRefs.push($(this))
            })

            for (const thisImg of imageRefs) {
              // Get the details we need.
              const formattedImgTag = {}
              formattedImgTag.url = thisImg.attr(`src`)
              formattedImgTag.title = thisImg.attr(`title`)
              formattedImgTag.alt = thisImg.attr(`alt`)

              if (!formattedImgTag.url) {
                return resolve()
              }

              const fileType = getImageInfo(formattedImgTag.url).ext

              // Only attempt to convert supported extensions
              if (
                isRelativeUrl(formattedImgTag.url) &&
                supportedExtensions[fileType]
              ) {
                const rawHTML = await generateImagesAndUpdateNode(
                  formattedImgTag,
                  resolve,
                  inLink
                )

                if (rawHTML) {
                  // Replace the image string
                  thisImg.replaceWith(rawHTML)
                } else {
                  return resolve()
                }
              }
            }

            // Replace the image node with an inline HTML node.
            node.type = `html`
            node.value = $(`body`).html() // fix for cheerio v1

            return resolve(node)
          })
      )
    ).then(htmlImageNodes =>
      markdownImageNodes.concat(htmlImageNodes).filter(node => !!node)
    )
  )
}
