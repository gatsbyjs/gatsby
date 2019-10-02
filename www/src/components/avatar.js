/** @jsx jsx */
import { jsx } from "theme-ui"
import Img from "gatsby-image"

const Avatar = ({ image, alt, customCSS }) => (
  <Img
    alt={alt ? alt : ``}
    fixed={image}
    sx={{
      borderRadius: 6,
      display: `inline-block`,
      m: 0,
      verticalAlign: `top`,
      // prevents image twitch in Chrome when hovering the card
      transform: `translateZ(0)`,
      ...customCSS,
    }}
  />
)

export default Avatar
