import React from "react"
import { Link } from "gatsby"
import { rhythm, scale, options } from "../utils/typography"
import presets, { colors } from "../utils/presets"
import hex2rgba from "hex2rgba"

import { css } from "glamor"

let stripeAnimation = css.keyframes({
  "0%": { backgroundPosition: `0 0` },
  "100%": { backgroundPosition: `30px 60px` },
})

const CtaButton = ({ to, overrideCSS, children }) => (
  <Link
    css={{
      ...overrideCSS,
      ...scale(1 / 5),
      display: `inline-block`,
      fontFamily: options.headerFontFamily.join(`,`),
      padding: `${rhythm(2 / 5)} ${rhythm(1 / 2)}`,
      borderRadius: presets.radius,
      [presets.Tablet]: {
        ...scale(2 / 5),
        padding: `${rhythm(1 / 4)} ${rhythm(3 / 5)}`,
      },
      [presets.VHd]: {
        padding: `${rhythm(1 / 2)} ${rhythm(1)}`,
      },
      // Increase specificity
      "&&": {
        border: `1px solid ${colors.gatsby}`,
        boxShadow: `none`,
        color: colors.gatsby,
        fontWeight: `normal`,
        backgroundColor: `transparent`,
        backgroundSize: `30px 30px`,
        transition: `all ${presets.animation.speedDefault} ${
          presets.animation.curveDefault
        }`,
        ":hover, &:focus": {
          backgroundSize: `30px 30px`,
          backgroundColor: colors.gatsby,
          backgroundImage: `linear-gradient(45deg, rgba(0,0,0, 0.1) 25%, transparent 25%, transparent 50%, rgba(0,0,0, 0.1) 50%, rgba(0,0,0, 0.1) 75%, transparent 75%, transparent)`,
          color: `#fff`,
          animation: `${stripeAnimation} 2.8s linear infinite`,
        },
        ":focus": {
          outline: 0,
          boxShadow: `0 0 0 0.2rem ${hex2rgba(colors.lilac, 0.25)}`,
        },
        ":after": {
          content: ``,
          display: `block`,
        },
      },
    }}
    to={to}
  >
    {children}
  </Link>
)

export default CtaButton
