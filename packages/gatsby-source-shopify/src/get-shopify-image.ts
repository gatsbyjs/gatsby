import {
  IUrlBuilderArgs,
  getImageData,
  IGatsbyImageData,
} from "gatsby-plugin-image"

const validFormats = new Set([`jpg`, `jpeg`, `png`, `webp`, `auto`])

export function urlBuilder({
  width,
  height,
  baseUrl,
  format,
}: IUrlBuilderArgs<unknown>): string {
  if (!validFormats.has(format)) {
    console.warn(
      `${format} is not a valid format. Valid formats are: ${[
        ...validFormats,
      ].join(`, `)}`
    )
    format = `auto`
  }

  let [basename, version] = baseUrl.split(`?`)

  const dot = basename.lastIndexOf(`.`)
  let ext = ``
  if (dot !== -1) {
    ext = basename.slice(dot + 1)
    basename = basename.slice(0, dot)
  }
  let suffix = ``
  if (format === ext || format === `auto`) {
    suffix = `.${ext}`
  } else {
    suffix = `.${ext}.${format}`
  }

  return `${basename}_${width}x${height}_crop_center${suffix}?${version}`
}

export function getShopifyImage({
  image,
  ...args
}: IGetShopifyImageArgs): IGatsbyImageData {
  const {
    originalSrc: baseUrl,
    width: sourceWidth,
    height: sourceHeight,
  } = image

  return getImageData({
    ...args,
    baseUrl,
    sourceWidth,
    sourceHeight,
    urlBuilder,
    formats: [`auto`],
  })
}
