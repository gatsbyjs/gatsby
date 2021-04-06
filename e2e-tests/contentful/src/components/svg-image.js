import React from "react"

const SvgImage = ({ alt, ...props }) => (
  <img style={{ width: "100%", height: "auto" }} alt={alt} {...props} />
)

export default SvgImage
