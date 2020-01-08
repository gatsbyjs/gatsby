/** @jsx jsx */
import { jsx } from "theme-ui"
import Img from "gatsby-image"

import { screenshot } from "./styles"

const Screenshot = ({ imageSharp, alt, boxShadow = true }) => (
  <div className="screenshot" sx={{ position: `relative` }}>
    {imageSharp && (
      <Img
        fluid={imageSharp}
        alt={alt ? alt : ``}
        sx={{ ...screenshot, boxShadow: boxShadow ? `raised` : false }}
      />
    )}
  </div>
)

export default Screenshot
