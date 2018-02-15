import React from "react"
import { Link } from "gatsby"
import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"

import { rhythm, scale, options } from "../utils/typography"
import presets, { colors } from "../utils/presets"
import CtaButton from "./cta-button"
import MastheadBg from "./masthead-bg"
import FuturaParagraph from "./futura-paragraph"
import { vP, vPHd, vPVHd, vPVVHd } from "../components/gutters"

const MastheadContent = () => (
  <div
    className="masthead-content"
    css={{
      display: `flex`,
      padding: vP,
      paddingTop: rhythm(4),
      paddingBottom: rhythm(1),
      paddingBottom: rhythm(1),
      flexGrow: `0`,
      flexShrink: `1`,
      [presets.Mobile]: {
        paddingBottom: rhythm(2),
      },
      [presets.Phablet]: {
        paddingRight: 0,
      },
      [presets.Tablet]: {
        paddingTop: rhythm(4),
      },
      [presets.Desktop]: {
        paddingTop: rhythm(5),
      },
      [presets.Hd]: {
        paddingTop: rhythm(5),
        paddingLeft: vPHd,
        paddingBottom: rhythm(3),
      },
      [presets.VHd]: {
        paddingTop: rhythm(6),
        paddingLeft: vPVHd,
      },
      [presets.VVHd]: {
        paddingLeft: vPVVHd,
      },
    }}
  >
    <div>
      <h1
        css={{
          ...scale(0.7),
          color: colors.gatsby,
          lineHeight: 1,
          margin: 0,
          marginBottom: `1.2em`,
          padding: 0,
          width: rhythm(10),
          //fontSize: `calc(12px + 2vh + 2vw)`,
          [presets.Mobile]: {
            width: rhythm(10),
          },
          "@media (min-width: 650px)": {
            fontSize: scale(1).fontSize,
            width: rhythm(12),
          },
          [presets.Tablet]: {
            fontSize: scale(1.1).fontSize,
            width: rhythm(12),
          },
          [presets.Hd]: {
            fontSize: scale(1.4).fontSize,
            width: rhythm(14),
          },
          [presets.VHd]: {
            fontSize: scale(1.5).fontSize,
            width: rhythm(16),
          },
          [presets.VVHd]: {
            fontSize: scale(1.6).fontSize,
            width: rhythm(18),
          },
        }}
      >
        Blazing-fast static site generator for React
      </h1>
      <CtaButton to="/docs/">
        <span css={{ verticalAlign: `middle` }}>Get Started</span>
        {` `}
        <ArrowForwardIcon
          css={{ verticalAlign: `baseline`, marginLeft: `.2em` }}
        />
      </CtaButton>
    </div>
  </div>
)

const Masthead = () => <MastheadContent />

export default Masthead
