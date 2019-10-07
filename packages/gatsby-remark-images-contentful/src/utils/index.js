const axios = require(`axios`)

const getBase64Img = async url => {
  const response = await axios({
    method: `GET`,
    responseType: `arraybuffer`,
    url: `${url}`,
  })

  const base64Img = `data:${
    response.headers[`content-type`]
  };base64,${new Buffer(response.data).toString(`base64`)}`

  return base64Img
}

const buildResponsiveSizes = async ({ metadata, imageUrl, options = {} }) => {
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

  const base64Img = await getBase64Img(`${imageUrl}?w=40`)

  const srcSet = filteredSizes
    .map(size => `${imageUrl}?w=${Math.round(size)} ${Math.round(size)}w`)
    .join(`,\n`)

  const webpSrcSet = filteredSizes
    .map(
      size => `${imageUrl}?fm=webp&w=${Math.round(size)} ${Math.round(size)}w`
    )
    .join(`,\n`)

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
