import React from "react"
import Img from "gatsby-image"

import { rhythm } from "../utils/typography"
import { space, radii } from "../utils/presets"

const Avatar = ({ image, alt }) => (
  <Img
    alt={alt ? alt : ``}
    fixed={image}
    css={{
      borderRadius: radii[6],
      display: `inline-block`,
      // todo remove
      marginRight: rhythm(space[3]),
      marginBottom: 0,
      verticalAlign: `top`,
      // prevents image twitch in Chrome when hovering the card
      transform: `translateZ(0)`,
    }}
  />
)

export default Avatar
