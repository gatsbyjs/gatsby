const {
  DEFAULT_OPTIONS,
  imageBackgroundClass,
  imageClass,
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
const { parse } = require(`@babel/parser`)
const generate = require(`@babel/generator`).default
const traverse = require(`@babel/traverse`).default
const types = require(`@babel/types`)

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
  },
  pluginOptions
) => {
  const options = _.defaults(pluginOptions, { pathPrefix }, DEFAULT_OPTIONS)

  const hasParentLinks = ({ children }) =>
    children.some(
      node =>
        (node.type === `html` && !!node.value.match(/<a /)) ||
        node.type === `link`
    )

  // Get all the available definitions in the markdown tree
  const definitions = getDefinitions(markdownAST)

  // This will allow the use of html image tags
  const rawHtmlNodes = []
  visitWithParents(markdownAST, [`html`], (node, ancestors) => {
    if (!node.value) {
      return
    }

    const linkToOriginal =
      options.linkImagesToOriginal && !ancestors.some(hasParentLinks)

    rawHtmlNodes.push({ node, linkToOriginal })
  })

  // This will allow the use of MDX
  const rawJsxNodes = []
  visitWithParents(markdownAST, [`jsx`], (node, ancestors) => {
    if (!node.value) {
      return
    }

    const linkToOriginal =
      options.linkImagesToOriginal && !ancestors.some(hasParentLinks)

    rawJsxNodes.push({ node, linkToOriginal })
  })

  // This will only work for markdown syntax image tags
  const markdownImageNodes = []
  visitWithParents(
    markdownAST,
    [`image`, `imageReference`],
    (node, ancestors) => {
      const linkToOriginal =
        options.linkImagesToOriginal && !ancestors.some(hasParentLinks)

      markdownImageNodes.push({ node, linkToOriginal })
    }
  )

  const getImageInfo = uri => {
    const { url, query } = queryString.parseUrl(uri)
    return {
      ext: path
        .extname(url)
        .split(`.`)
        .pop(),
      url,
      query,
    }
  }

  const getImageCaption = (node, overWrites) => {
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

    return compiler.generateHTML(compiler.parseString(captionString))
  }

  // Takes a node and generates the needed images and then returns
  // the needed HTML replacement for the image
  const generateImagesAndUpdateNode = async function(
    node,
    resolve,
    linkToOriginal,
    overWrites = {}
  ) {
    // Check if this markdownNode has a File parent. This plugin
    // won't work if the image isn't hosted locally.
    const parentNode = getNode(markdownNode.parent)
    let imagePath
    if (parentNode && parentNode.dir) {
      imagePath = slash(path.join(parentNode.dir, getImageInfo(node.url).url))
    } else {
      return null
    }

    const imageNode = _.find(files, file => {
      if (file && file.absolutePath) {
        return file.absolutePath === imagePath
      }
      return null
    })

    if (!imageNode || !imageNode.absolutePath) {
      return resolve()
    }

    let fluidResult = await fluid({
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

    const alt = _.escape(
      overWrites.alt ? overWrites.alt : node.alt ? node.alt : defaultAlt
    )

    const title = node.title ? _.escape(node.title) : alt

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
      />
    `.trim()

    // if options.withWebp is enabled, generate a webp version and change the image tag to a picture tag
    if (options.withWebp) {
      const webpFluidResult = await fluid({
        file: imageNode,
        args: _.defaults(
          { toFormat: `WEBP` },
          // override options if it's an object, otherwise just pass through defaults
          options.withWebp === true ? {} : options.withWebp,
          pluginOptions,
          DEFAULT_OPTIONS
        ),
        reporter,
      })

      if (!webpFluidResult) {
        return resolve()
      }

      imageTag = `
      <picture>
        <source
          srcset="${webpFluidResult.srcSet}"
          sizes="${webpFluidResult.sizes}"
          type="${webpFluidResult.srcSetType}"
        />
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
          style="${imageStyle}"
        />
      </picture>
      `.trim()
    }

    let placeholderImageData = fluidResult.base64

    // if options.tracedSVG is enabled generate the traced SVG and use that as the placeholder image
    if (options.tracedSVG) {
      let args = typeof options.tracedSVG === `object` ? options.tracedSVG : {}

      // Translate Potrace constants (e.g. TURNPOLICY_LEFT, COLOR_AUTO) to the values Potrace expects
      const { Potrace } = require(`potrace`)
      const argsKeys = Object.keys(args)
      args = argsKeys.reduce((result, key) => {
        const value = args[key]
        result[key] = Potrace.hasOwnProperty(value) ? Potrace[value] : value
        return result
      }, {})

      const tracedSVG = await traceSVG({
        file: imageNode,
        args,
        fileArgs: args,
        cache,
        reporter,
      })

      // Escape single quotes so the SVG data can be used in inline style attribute with single quotes
      placeholderImageData = tracedSVG.replace(/'/g, `\\'`)
    }

    const ratio = `${(1 / fluidResult.aspectRatio) * 100}%`

    const wrapperStyle =
      typeof options.wrapperStyle === `function`
        ? options.wrapperStyle(fluidResult)
        : options.wrapperStyle

    // Construct new image node w/ aspect ratio placeholder
    const imageCaption =
      options.showCaptions && getImageCaption(node, overWrites)

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
    if (linkToOriginal) {
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
      style="position: relative; display: block; margin-left: auto; margin-right: auto; ${
        imageCaption ? `` : wrapperStyle
      } max-width: ${presentationWidth}px;"
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

  const markdownImageNodesPromise = Promise.all(
    // Simple because there is no nesting in markdown
    markdownImageNodes.map(
      ({ node, linkToOriginal }) =>
        new Promise(async (resolve, reject) => {
          const overWrites = {}
          let refNode
          if (
            !node.hasOwnProperty(`url`) &&
            node.hasOwnProperty(`identifier`)
          ) {
            //consider as imageReference node
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

          // Ignore gifs as we can't process them,
          // svgs as they are already responsive by definition
          if (
            isRelativeUrl(node.url) &&
            fileType !== `gif` &&
            fileType !== `svg`
          ) {
            const rawHTML = await generateImagesAndUpdateNode(
              node,
              resolve,
              linkToOriginal,
              overWrites
            )

            if (rawHTML) {
              // Replace the image or ref node with an inline HTML node.
              if (refNode) {
                node = refNode
              }
              node.type = `html`
              node.value = rawHTML
            }
            return resolve(node)
          } else {
            // Image isn't relative so there's nothing for us to do.
            return resolve()
          }
        })
    )
  )

  async function useBabel(node, linkToOriginal) {
    const ast = parse(node.value, {
      plugins: [`jsx`, `typescript`],
      sourceType: `module`,
    })

    const imagePaths = []

    let astLinkCount = 0
    traverse(ast, {
      JSXElement(path) {
        if (path.node.openingElement.name.name === `img`) {
          const astInLink = astLinkCount > 0
          imagePaths.push({
            imagePath: path,
            astInLink,
          })
        }
      },
      JSXOpeningElement(path) {
        if (path.node.name.name === `a`) {
          ++astLinkCount
        }
      },
      JSXClosingElement(path) {
        if (path.node.name.name === `a`) {
          --astLinkCount
        }
      },
    })

    if (imagePaths.length === 0) {
      // No img tags
      return null
    }

    let valueChanged = false
    let newRootValue = null

    await Promise.all(
      imagePaths.map(
        ({ imagePath, astInLink }) =>
          new Promise(async resolve => {
            // Get the details we need.
            const getAttributeValue = name => {
              const attribute = imagePath.node.openingElement.attributes.find(
                attribute =>
                  attribute.type === `JSXAttribute` &&
                  attribute.name.type === `JSXIdentifier` &&
                  attribute.name.name === name &&
                  attribute.value.type === `StringLiteral`
              )

              return attribute && attribute.value.value
            }

            const url = getAttributeValue(`src`)

            if (!url) {
              return resolve()
            }

            const fileType = getImageInfo(url).ext

            // Ignore gifs as we can't process them,
            // svgs as they are already responsive by definition
            if (
              isRelativeUrl(url) &&
              fileType !== `gif` &&
              fileType !== `svg`
            ) {
              const formattedImgTag = {
                alt: getAttributeValue(`alt`),
                title: getAttributeValue(`title`),
                url,
              }

              let imageLinkToOriginal = linkToOriginal && !astInLink
              const classNames = getAttributeValue(`className`)
              if (classNames) {
                const classList = classNames.split(` `)
                if (imageLinkToOriginal) {
                  imageLinkToOriginal = !classList.some(className =>
                    options.forceNoLinkClassNames.includes(className)
                  )
                } else {
                  imageLinkToOriginal = classList.some(className =>
                    options.forceLinkClassNames.includes(className)
                  )
                }
              }

              const rawHTML = await generateImagesAndUpdateNode(
                formattedImgTag,
                resolve,
                imageLinkToOriginal
              )

              // Replace the image string
              if (rawHTML) {
                valueChanged = true
                try {
                  imagePath.replaceWith(types.jsxText(rawHTML))
                } catch (err) {
                  // If imagePath has the root node, an error is thrown because text can't be set at root.
                  if (err instanceof TypeError) {
                    newRootValue = rawHTML
                  } else {
                    throw err
                  }
                }
              }
            }

            return resolve()
          })
      )
    )

    if (!valueChanged) {
      // No need to dump AST
      return null
    }

    if (newRootValue) {
      node.value = newRootValue
    } else {
      let rawJSX = generate(ast, {}, node.value).code

      // Strip the final semicolon
      rawJSX = rawJSX.slice(0, rawJSX.length - 1)

      // Replace the image node with an inline HTML node.
      node.value = rawJSX
    }

    return node
  }

  function useCheerio(node, linkToOriginal) {
    return new Promise(async resolve => {
      const $ = cheerio.load(node.value)
      if ($(`img`).length === 0) {
        // No img tags
        return resolve()
      }

      let imageRefs = []
      $(`img`).each(function() {
        imageRefs.push($(this))
      })

      for (const thisImg of imageRefs) {
        const url = thisImg.attr(`src`)

        if (!url) {
          return resolve()
        }

        const fileType = getImageInfo(url).ext

        // Ignore gifs as we can't process them,
        // svgs as they are already responsive by definition
        if (isRelativeUrl(url) && fileType !== `gif` && fileType !== `svg`) {
          // Get the details we need.
          const formattedImgTag = {
            url,
            title: thisImg.attr(`title`),
            alt: thisImg.attr(`alt`),
          }

          let imageLinkToOriginal = linkToOriginal
          if (imageLinkToOriginal) {
            imageLinkToOriginal = !options.forceNoLinkClassNames.some(
              className => thisImg.hasClass(className)
            )
          } else {
            imageLinkToOriginal = options.forceLinkClassNames.some(className =>
              thisImg.hasClass(className)
            )
          }

          const rawHTML = await generateImagesAndUpdateNode(
            formattedImgTag,
            resolve,
            imageLinkToOriginal
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
      if (node.type !== `jsx`) {
        node.type = `html`
      }
      node.value = $(`body`).html() // fix for cheerio v1

      return resolve(node)
    })
  }

  // HTML image node stuff
  // Complex because HTML nodes can contain multiple images
  const rawHtmlNodesPromise = Promise.all(
    rawHtmlNodes.map(({ node, linkToOriginal }) =>
      useCheerio(node, linkToOriginal)
    )
  )

  const rawJsxNodesPromise = Promise.all(
    rawJsxNodes.map(({ node, linkToOriginal }) =>
      useBabel(node, linkToOriginal).catch(err => {
        console.log(
          `Error while parsing JSX with Babel, using Cheerio fallback.`
        )
        console.log(err)
        return useCheerio(node, linkToOriginal)
      })
    )
  )

  return Promise.all([
    markdownImageNodesPromise,
    rawHtmlNodesPromise,
    rawJsxNodesPromise,
  ]).then(([markdownImageNodes, rawHtmlImageNodes, rawJsxImageNodes]) =>
    markdownImageNodes
      .concat(rawHtmlImageNodes)
      .concat(rawJsxImageNodes)
      .filter(node => !!node)
  )
}
