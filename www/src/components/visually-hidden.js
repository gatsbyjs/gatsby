import React from "react"
import { visuallyHidden } from "../utils/styles"

const VisuallyHidden = props => {
  return <span sx={visuallyHidden} {...props} />
}

export default VisuallyHidden
