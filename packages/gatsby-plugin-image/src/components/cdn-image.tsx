import { FunctionComponent } from "react"
import { GatsbyImage } from "./gatsby-image.server"
import { CdnImageProps, getCdnImage } from "./cdn-image.browser"

export const CdnImage: FunctionComponent<CdnImageProps> = getCdnImage(
  GatsbyImage
)
