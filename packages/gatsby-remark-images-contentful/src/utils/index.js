const axios = require(`axios`)

const getBase64Img = async (url, reporter) => {
  let base64Img
  try {
    const response = await axios({
      method: `GET`,
      responseType: `arraybuffer`,
      url: `${url}`,
    })

    base64Img = `data:${response.headers[`content-type`]};base64,${new Buffer(
      response.data
    ).toString(`base64`)}`
  } catch (err) {
    reporter.panic(`Failed downloading the base64 image for ${url}`, err)
  }

  return base64Img
}

const buildResponsiveSizes = async (
  { metadata, imageUrl, options = {} },
  reporter
) => {
  // Remove search params from the image url
  let formattedImgUrl = imageUrl
  if (imageUrl.includes(`?`)) {
    formattedImgUrl = imageUrl.split(`?`)[0]
  }

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

  const base64Img = await getBase64Img(`${formattedImgUrl}?w=40`, reporter)

  const srcSet = filteredSizes
    .map(
      size => `${formattedImgUrl}?w=${Math.round(size)} ${Math.round(size)}w`
    )
    .join(`,\n`)

  const webpSrcSet = filteredSizes
    .map(
      size =>
        `${formattedImgUrl}?fm=webp&w=${Math.round(size)} ${Math.round(size)}w`
    )
    .join(`,\n`)

  // TODO think about a better structure to save srcset types instead of adding them to the root
  return {
    base64: base64Img,
    aspectRatio,
    srcSet,
    webpSrcSet,
    src: formattedImgUrl,
    sizes: sizesQuery,
    density,
    presentationWidth,
    presentationHeight,
  }
}

exports.buildResponsiveSizes = buildResponsiveSizes
exports.getBase64Img = getBase64Img
