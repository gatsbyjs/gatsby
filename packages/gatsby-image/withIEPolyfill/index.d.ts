import * as React from "react"

import GatsbyImage, { GatsbyImageProps } from "../index"

type GatsbyImageWithIEPolyfillProps = GatsbyImageProps & {
  objectFit?: `fill` | `contain` | `cover` | `none` | `scale-down`
  objectPosition?: string
}

export default class GatsbyImageWithIEPolyfill extends React.Component<
  GatsbyImageWithIEPolyfillProps
> {}
