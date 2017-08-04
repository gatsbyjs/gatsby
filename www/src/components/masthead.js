import Link from "gatsby-link"
import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"

import { rhythm, scale, options } from "../utils/typography"
import presets from "../utils/presets"
import CtaButton from "./cta-button"
import MastheadBg from "./masthead-bg"
import FuturaParagraph from "./futura-paragraph"
import { vP, vPHd, vPVHd, vPVVHd } from "../components/gutters"

const MastheadContent = () =>
  <div
    className="Masthead-content"
    css={{
      display: `flex`,
      padding: vP,
      paddingTop: rhythm(4),
      paddingBottom: rhythm(1),
      maxWidth: rhythm(14),
      paddingBottom: rhythm(1),
      transition: `padding-top ${presets.animation.speedFast} ${presets
        .animation.curveDefault}`,
      flexGrow: `0`,
      flexShrink: `1`,
      //background: `rgba(255,255,0,0.2)`,
      [presets.Mobile]: {
        paddingBottom: rhythm(2),
      },
      [presets.Phablet]: {},
      [presets.Desktop]: {
        paddingTop: rhythm(5),
      },
      [presets.Hd]: {
        paddingLeft: vPHd,
        paddingRight: vPHd,
        paddingBottom: rhythm(3),
      },
      [presets.VHd]: {
        paddingLeft: vPVHd,
        paddingRight: vPVHd,
      },
      [presets.VVHd]: {
        paddingLeft: vPVVHd,
        paddingRight: vPVVHd,
      },
    }}
  >
    <div>
      <h1
        css={{
          ...scale(0.7),
          color: presets.brand,
          lineHeight: 1,
          margin: 0,
          marginBottom: `1.2em`,
          padding: 0,
          letterSpacing: `-0.0075em`,
          transition: `font-size .05s ease-in`,
          //fontSize: `calc(12px + 2vh + 2vw)`,
          [presets.Mobile]: {
            fontSize: scale(0.9).fontSize,
            width: rhythm(13),
          },
          [presets.Tablet]: {
            fontSize: scale(1.1).fontSize,
            width: rhythm(14),
          },
          [presets.Hd]: {
            fontSize: scale(1.4).fontSize,
            width: rhythm(18),
          },
          [presets.VHd]: {
            fontSize: scale(1.5).fontSize,
            width: rhythm(20),
          },
          [presets.VVHd]: {
            fontSize: scale(1.6).fontSize,
            width: rhythm(22),
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

const Masthead = () => <MastheadContent />

export default Masthead
