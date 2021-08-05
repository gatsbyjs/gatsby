import * as React from "react"

export interface FixedObject {
  width: number
  height: number
  src: string
  srcSet: string
  base64?: string
  tracedSVG?: string
  srcWebp?: string
  srcSetWebp?: string
  media?: string
}

export interface FluidObject {
  aspectRatio: number
  src: string
  srcSet: string
  sizes: string
  base64?: string
  tracedSVG?: string
  srcWebp?: string
  srcSetWebp?: string
  media?: string
}

interface GatsbyImageOptionalProps {
  /**
   * @deprecated Use `fixed`
   */
  resolutions?: FixedObject
  /**
   * @deprecated Use `fluid`
   */
  sizes?: FluidObject
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
  onError?: (event: any) => void
  onStartLoad?: (param: { wasCached: boolean }) => void
  Tag?: string
  itemProp?: string
  loading?: `auto` | `lazy` | `eager`
  draggable?: boolean
}
  
interface GatsbyImageFluidProps extends GatsbyImageOptionalProps {
  fluid: FluidObject | FluidObject[]
}

interface GatsbyImageFixedProps extends GatsbyImageOptionalProps {
  fixed: FixedObject | FixedObject[]
}

export type GatsbyImageProps = GatsbyImageFluidProps | GatsbyImageFixedProps

export default class GatsbyImage extends React.Component<
  GatsbyImageProps,
  any
> {}
