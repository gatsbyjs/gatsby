const { URL } = require(`url`)
const axios = require(`axios`)

// This should be replaced with the solution for https://github.com/gatsbyjs/gatsby/issues/24220
const getBase64Img = async (url, reporter) => {
  try {
    const response = await axios({
      method: `GET`,
      responseType: `arraybuffer`,
      url: `${url}`,
    })

    const base64Img = `data:${
      response.headers[`content-type`]
    };base64,${new Buffer(response.data).toString(`base64`)}`

    return base64Img
  } catch (err) {
    reporter.panic(`Failed downloading the base64 image for ${url}`, err)
    return undefined
  }
}

const buildResponsiveSizes = async (
  { metadata, imageUrl, options = {} },
  reporter
) => {
  const imageURL = new URL(
    imageUrl.indexOf(`/`) === 0 ? `https:${imageUrl}` : imageUrl
  )

  const { width, height, density } = metadata
  const { sizeByPixelDensity, maxWidth, sizes } = options
  const aspectRatio = width / height
  const pixelRatio =
    sizeByPixelDensity && typeof density === `number` && density > 0
      ? density / 72
      : 1

  const presentationWidth = Math.min(maxWidth, Math.round(width / pixelRatio))
  const presentationHeight = Math.round(presentationWidth * (height / width))
  const sizesQuery =
    sizes || `(max-width: ${presentationWidth}px) 100vw, ${presentationWidth}px`

  const images = []

  images.push(metadata.width / 4)
  images.push(metadata.width / 2)
  images.push(metadata.width)
  images.push(metadata.width * 1.5)
  images.push(metadata.width * 2)
  images.push(metadata.width * 3)

  const filteredSizes = images.filter(size => size < width)

  filteredSizes.push(width)

  imageURL.searchParams.set(`w`, `40`)

  const base64Img = await getBase64Img(imageURL.href, reporter)

  const getSrcSetUrl = size => {
    imageURL.searchParams.set(`w`, `${Math.round(size)}`)
    return `${imageURL.href} ${Math.round(size)}w`
  }

  const srcSet = filteredSizes.map(getSrcSetUrl).join(`,\n`)

  imageURL.searchParams.set(`fm`, `webp`)

  const webpSrcSet = filteredSizes.map(getSrcSetUrl).join(`,\n`)

  // TODO think about a better structure to save srcset types instead of adding them to the root
  return {
    base64: base64Img,
    aspectRatio,
    srcSet,
    webpSrcSet,
    src: imageUrl,
    sizes: sizesQuery,
    density,
    presentationWidth,
    presentationHeight,
  }
}

exports.buildResponsiveSizes = buildResponsiveSizes
exports.getBase64Img = getBase64Img
