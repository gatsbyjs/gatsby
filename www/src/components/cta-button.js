import Link from "gatsby-link"
import { rhythm, scale, options } from "../utils/typography"
import presets from "../utils/presets"

import { css } from "glamor"

let bounce = css.keyframes({
  "0%": { backgroundPosition: `0 0` },
  "100%": { backgroundPosition: `30px 60px` },
})

const ctaButtonStyles = {
  ...scale(1 / 5),
  display: `inline-block`,
  fontFamily: options.headerFontFamily.join(`,`),
  padding: `${rhythm(1 / 3)} ${rhythm(1 / 2)}`,
  borderRadius: `3px`,
  // Increase specificity
  [presets.Mobile]: {
    ...scale(2 / 5),
    padding: `${rhythm(1 / 2)} ${rhythm(1)}`,
  },
  "&&": {
    border: `1px solid #744c9e`,
    boxShadow: `none`,
    //boxShadow: `0 5px 50px (0,0,0,0.2)`,
    color: `#744c9e`,
    backgroundColor: presets.heroBright,
    backgroundSize: `30px 30px`,
    transiton: `all .15s ease-out`,
    ":hover": {
      backgroundSize: `30px 30px`,
      backgroundColor: `#744c9e`,
      backgroundImage: `
        linear-gradient(45deg, rgba(0,0,0, 0.1) 25%, transparent 25%, transparent 50%, rgba(0,0,0, 0.1) 50%, rgba(0,0,0, 0.1) 75%, transparent 75%, transparent)`,
      color: `white`,
      animation: `${bounce} 2.8s linear infinite`,
    },
    ":after": {
      content: ``,
      display: `block`,
    },
  },
}

const CtaButton = ({ to, children }) =>
  <Link css={ctaButtonStyles} to={to}>
    {children}
  </Link>

export default CtaButton
