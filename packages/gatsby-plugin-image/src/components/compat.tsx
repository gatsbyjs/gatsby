import { FunctionComponent } from "react"
import { GatsbyImage as GatsbyImageOriginal } from "./gatsby-image.server"
import { ICompatProps, _createCompatLayer } from "./compat.browser"

export const GatsbyImage: FunctionComponent<ICompatProps> = _createCompatLayer(
  GatsbyImageOriginal
)
