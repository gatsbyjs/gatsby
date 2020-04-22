import React from "react"

import { Box } from "./system"

const ImagePlaceholder = ({ aspectRatio, ...props }) => (
  <Box
    {...props}
    pb={aspectRatio ? `${aspectRatio * 100}%` : `${(9 / 16) * 100}%`}
  />
)

ImagePlaceholder.defaultProps = {
  bg: `grey.10`,
  flex: `0 0 auto`,
  height: 0,
  width: `100%`,
}

export default ImagePlaceholder
