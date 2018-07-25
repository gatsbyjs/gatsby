import * as React from "react"

interface FixedObject {
  width: number
  height: number
  src: string
  srcSet: string
  base64?: string
  tracedSVG?: string
  srcWebp?: string
  srcSetWebp?: string
}

interface FluidObject {
  aspectRatio: number
  src: string
  srcSet: string
  sizes: string
  base64: string
  tracedSVG: string
  srcWebp: string
  srcSetWebp: string
}

interface GatsbyImageProps {
  resolutions?: FixedObject
  sizes?: FluidObject
  fixed?: FixedObject
  fluid?: FluidObject
  fadeIn?: boolean
  title?: string
  alt?: string
  className?: string | object
  outerWrapperClassName?: string | object
  style?: object
  imgStyle?: object
  placeholderStyle: object
  position?: string
  backgroundColor?: string | boolean
  onLoad?: () => void
  onStartLoad?: (param: { wasCached: boolean }) => void
  Tag?: string
}

export default class GatsbyImage extends React.Component<
  GatsbyImageProps,
  any
> {}
