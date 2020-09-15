import { murmurhash } from "babel-plugin-remove-graphql-queries/murmur"
import {
  removeDefaultValues,
  healOptions,
  getPluginOptions,
} from "gatsby-plugin-sharp/plugin-options"

export interface ISomeGatsbyImageProps {
  fadeIn?: boolean
  durationFadeIn?: number
  title?: string
  alt?: string
  className?: string | object
  critical?: boolean
  crossOrigin?: string | boolean
  style?: object
  imgStyle?: object
  placeholderStyle?: object
  placeholderClassName?: string
  backgroundColor?: string | boolean
  onLoad?: () => void
  onError?: (event: Event) => void
  onStartLoad?: (param: { wasCached: boolean }) => void
  Tag?: string
  itemProp?: string
  loading?: `auto` | `lazy` | `eager`
  draggable?: boolean
}

export interface ICommonImageProps {
  quality?: number
  jpegQuality?: number
  pngQuality?: number
  webpQuality?: number
  grayscale?: boolean
  duotone?: false | { highlight: string; shadow: string }
  toFormat?: "NO_CHANGE" | "JPG" | "PNG" | "WEBP"
  cropFocus?:
    | "CENTER"
    | "NORTH"
    | "NORTHEAST"
    | "EAST"
    | "SOUTHEAST"
    | "SOUTH"
    | "SOUTHWEST"
    | "WEST"
    | "NORTHWEST"
    | "ENTROPY"
    | "ATTENTION"
  pngCompressionSpeed?: number
  rotate?: number
}

export interface IFluidImageProps extends ICommonImageProps {
  fluid?: true
  maxWidth?: number
  maxHeight?: number
  srcSetBreakpoints?: Array<number>
  fit?: number
  background?: number
}

export interface IFixedImageProps extends ICommonImageProps {
  fixed?: true
  width?: number
  height?: number
}

export type ImageProps = IFluidImageProps | IFixedImageProps
export type AnyImageProps = (IFluidImageProps | IFixedImageProps) &
  ICommonImageProps

export type AllProps = IImageOptions &
  IFluidImageProps &
  IFixedImageProps &
  ISomeGatsbyImageProps & { src: string }

export interface IImageOptions {
  webP?: boolean
  base64?: boolean
  tracedSVG?: boolean
}

export const splitProps = (
  props: AllProps
): {
  commonOptions: ICommonImageProps
  fluidOptions?: IFluidImageProps
  fixedOptions?: IFixedImageProps
  isFluid: boolean
  isFixed: boolean
  imageOptions: IImageOptions
  gatsbyImageProps: ISomeGatsbyImageProps
  src: string
} => {
  const {
    fluid,
    fixed,
    quality,
    jpegQuality,
    pngQuality,
    webpQuality,
    grayscale,
    duotone,
    toFormat,
    cropFocus,
    pngCompressionSpeed,
    maxWidth,
    maxHeight,
    srcSetBreakpoints,
    fit,
    background,
    width,
    height,
    webP,
    base64,
    tracedSVG,
    src,
    ...gatsbyImageProps
  } = props

  const isFixed = fixed ?? !fluid

  console.log({ isFixed, fixed, fluid })

  const commonOptions: ICommonImageProps = {
    quality,
    jpegQuality,
    pngQuality,
    webpQuality,
    grayscale,
    duotone,
    toFormat,
    cropFocus,
    pngCompressionSpeed,
  }

  const fluidOptions: IFluidImageProps | undefined = isFixed
    ? undefined
    : {
        fluid: !isFixed as true,
        maxWidth,
        maxHeight,
        srcSetBreakpoints,
        fit,
        background,
      }

  const imageOptions: IImageOptions = {
    webP,
    base64,
    tracedSVG,
  }

  const fixedOptions: IFixedImageProps | undefined = isFixed
    ? {
        fixed: isFixed as true,
        width,
        height,
      }
    : undefined

  return {
    src,
    commonOptions,
    fluidOptions,
    fixedOptions,
    isFluid: !isFixed,
    isFixed,
    imageOptions,
    gatsbyImageProps,
  }
}

const quoteValue = (key: string, value: unknown): string =>
  [`toFormat`, `cropFocus`].includes(key)
    ? (value as string).toString().toUpperCase()
    : JSON.stringify(value)

const optionsFromProps = (props: AnyImageProps): string =>
  (Object.keys(props) as Array<keyof AnyImageProps>)
    .map(key => `${key}: ${quoteValue(key, props[key])}`)
    .join(`, `)

const imageFragmentFromProps = ({
  webP,
  base64 = true,
  tracedSVG,
}: IImageOptions): string => {
  const parts: Array<string> = []
  if (webP) {
    parts.push(`_withWebp`)
  }
  if (tracedSVG) {
    parts.push(`_tracedSVG`)
  } else if (!base64) {
    parts.push(`_noBase64`)
  }
  return parts.join(``)
}

const fluidFragment = (
  props: IFluidImageProps & ICommonImageProps,
  options: IImageOptions
): string => `            
fluid(${optionsFromProps(props)}) {
    ...GatsbyImageSharpFluid${imageFragmentFromProps(options)}
}
`

const fixedFragment = (
  props: IFixedImageProps & ICommonImageProps,
  options: IImageOptions
): string => `            
fixed(${optionsFromProps(props)}) {
    ...GatsbyImageSharpFixed${imageFragmentFromProps(options)}
}
`

export const queryFromProps = ({
  fixed,
  fluid,
  ...props
}: AllProps): string => {
  if (!props.src) {
    throw new Error(`Missing 'src' prop`)
  }

  const ext = (props.src as string).split(`.`).pop()

  const { nodeType = `file`, toFormat: format, ...options } = healOptions(
    getPluginOptions(),
    props,
    ext
  )

  if (format !== ext) {
    options.toFormat = ext
  }

  const {
    isFluid,
    commonOptions,
    fixedOptions,
    fluidOptions,
    imageOptions,
  } = splitProps({ fixed, fluid, ...options })

  console.log({
    isFluid,
    commonOptions,
    fixedOptions,
    fluidOptions,
    imageOptions,
  })

  const fragment = isFluid
    ? fluidFragment(
        removeDefaultValues({ ...fluidOptions, ...commonOptions }, {}),
        imageOptions
      )
    : fixedFragment(
        removeDefaultValues({ ...fixedOptions, ...commonOptions }, {}),
        imageOptions
      )

  return `
query {
    staticImage: ${nodeType}(relativePath: { eq: "${props.src}" }) {
        childImageSharp {
            ${fragment}
        }
    }
}
`
}

export const hashFromQuery = (query: string): number => murmurhash(query, 0)

export const hashFromProps = (props: AllProps): number =>
  hashFromQuery(queryFromProps(props))
