const { selectAll } = require(`unist-util-select`)
// TODO(v5): use gatsby/sharp
const getSharpInstance = require(`./safe-sharp`)
const axios = require(`axios`)
const _ = require(`lodash`)
const Promise = require(`bluebird`)
const cheerio = require(`cheerio`)
const chalk = require(`chalk`)
const { buildResponsiveSizes } = require(`./utils`)

// If the image is hosted on contentful
// 1. Find the image file
// 2. Find the image's size
// 3. Filter out any responsive image sizes that are greater than the image's width
// 4. Create the responsive images.
// 5. Set the html w/ aspect ratio helper.

module.exports = async (
  {
    files,
    markdownNode,
    markdownAST,
    pathPrefix,
    getNode,
    reporter,
    cache,
    createContentDigest,
  },
  pluginOptions
) => {
  const defaults = {
    maxWidth: 650,
    wrapperStyle: ``,
    backgroundColor: `white`,
    linkImagesToOriginal: true,
    showCaptions: false,
    pathPrefix,
    withWebp: false,
    loading: `lazy`,
  }

  // This will only work for markdown syntax image tags
  const markdownImageNodes = selectAll(`image`, markdownAST)

  // This will also allow the use of html image tags
  const rawHtmlNodes = selectAll(`html`, markdownAST)

  const generateImagesAndUpdateNode = async function (node) {
    let originalImg = node.url
    if (!/^(http|https)?:\/\//i.test(node.url)) {
      originalImg = `https:${node.url}`
    }

    const srcSplit = node.url.split(`/`)
    const fileName = srcSplit[srcSplit.length - 1]
    const options = _.defaults({}, pluginOptions, defaults)

    const optionsHash = createContentDigest(options)

    const cacheKey = `remark-images-ctf-${node.url}-${optionsHash}`
    const cachedRawHTML = await cache.get(cacheKey)

    if (cachedRawHTML) {
      return cachedRawHTML
    }
    const sharp = await getSharpInstance()
    const metaReader = sharp()

    // @todo to increase reliablility, this should use the asset downloading function from gatsby-source-contentful
    let response
    try {
      response = await axios({
        method: `GET`,
        url: originalImg, // for some reason there is a './' prefix
        responseType: `stream`,
      })
    } catch (err) {
      reporter.panic(
        `Image downloading failed for ${originalImg}, please check if the image still exists on contentful`,
        err
      )
      return []
    }

    response.data.pipe(metaReader)

    let metadata
    try {
      metadata = await metaReader.metadata()
    } catch (error) {
      console.log(error)
      reporter.panic(
        `The image "${node.url}" (with alt text: "${node.alt}") doesn't appear to be a supported image format.`,
        error
      )
    }

    response.data.destroy()

    const responsiveSizesResult = await buildResponsiveSizes(
      {
        metadata,
        imageUrl: originalImg,
        options,
      },
      reporter
    )

    // Calculate the paddingBottom %
    const ratio = `${(1 / responsiveSizesResult.aspectRatio) * 100}%`

    const fallbackSrc = originalImg
    const srcSet = responsiveSizesResult.srcSet
    const presentationWidth = responsiveSizesResult.presentationWidth

    // Generate default alt tag
    const fileNameNoExt = fileName.replace(/\.[^/.]+$/, ``)
    const defaultAlt = fileNameNoExt.replace(/[^A-Z0-9]/gi, ` `)

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

    // Create our base image tag
    let imageTag = `
      <img
        class="gatsby-resp-image-image"
        style="width: 100%; height: 100%; margin: 0; vertical-align: middle; position: absolute; top: 0; left: 0; box-shadow: inset 0px 0px 0px 400px ${
          options.backgroundColor
        };"
        alt="${node.alt ? node.alt : defaultAlt}"
        title="${node.title ? node.title : ``}"
        src="${fallbackSrc}"
        srcset="${srcSet}"
        sizes="${responsiveSizesResult.sizes}"
        loading="${loading}"
      />
   `.trim()

    // if options.withWebp is enabled, generate a webp version and change the image tag to a picture tag
    if (options.withWebp) {
      imageTag = `
        <picture>
          <source
            srcset="${responsiveSizesResult.webpSrcSet}"
            sizes="${responsiveSizesResult.sizes}"
            type="image/webp"
          />
          <source
            srcset="${srcSet}"
            sizes="${responsiveSizesResult.sizes}"
          />
          <img
            class="gatsby-resp-image-image"
            style="width: 100%; height: 100%; margin: 0; vertical-align: middle; position: absolute; top: 0; left: 0; box-shadow: inset 0px 0px 0px 400px ${
              options.backgroundColor
            };"
            alt="${node.alt ? node.alt : defaultAlt}"
            title="${node.title ? node.title : ``}"
            src="${fallbackSrc}"
            loading="${loading}"
          />
        </picture>
      `.trim()
    }

    // Construct new image node w/ aspect ratio placeholder
    let rawHTML = `
      <span
        class="gatsby-resp-image-wrapper"
        style="position: relative; display: block; ${options.wrapperStyle}; max-width: ${presentationWidth}px; margin-left: auto; margin-right: auto;"
      >
        <span
          class="gatsby-resp-image-background-image"
          style="padding-bottom: ${ratio}; position: relative; bottom: 0; left: 0; background-image: url('${responsiveSizesResult.base64}'); background-size: cover; display: block;"
        >
          ${imageTag}
        </span>
      </span>
    `.trim()

    // Make linking to original image optional.
    if (options.linkImagesToOriginal) {
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

    // Wrap in figure and use title as caption

    if (options.showCaptions && node.title) {
      rawHTML = `
<figure class="gatsby-resp-image-figure">
${rawHTML}
<figcaption class="gatsby-resp-image-figcaption">${node.title}</figcaption>
</figure>`
    }
    await cache.set(cacheKey, rawHTML)
    return rawHTML
  }
  return Promise.all(
    // Simple because there is no nesting in markdown
    markdownImageNodes.map(
      node =>
        new Promise(resolve => {
          if (node.url.indexOf(`images.ctfassets.net`) !== -1) {
            return generateImagesAndUpdateNode(node).then(rawHTML => {
              if (rawHTML) {
                // Replace the image node with an inline HTML node.
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
        node =>
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

              if (formattedImgTag.url.indexOf(`images.ctfassets.net`) !== -1) {
                const rawHTML = await generateImagesAndUpdateNode(
                  formattedImgTag,
                  resolve
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
