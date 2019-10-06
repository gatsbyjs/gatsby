/** @jsx jsx */
import { jsx } from "theme-ui"
import Img from "gatsby-image"

const Avatar = ({ image, alt, overrideCSS }) => (
  <Img
    alt={alt ? alt : ``}
    fixed={image}
    sx={{
      borderRadius: 6,
      display: `inline-block`,
      m: 0,
      // prevents image twitch in Chrome when hovering the card
      transform: `translateZ(0)`,
      verticalAlign: `top`,
      ...overrideCSS,
    }}
  />
)

export default Avatar
