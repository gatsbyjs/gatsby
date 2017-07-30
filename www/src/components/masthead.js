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
      padding: vP,
      paddingTop: rhythm(4),
      paddingBottom: rhythm(2),
      width: rhythm(14),
      [presets.Mobile]: {
        paddingBottom: rhythm(3),
        width: rhythm(17),
      },
      [presets.Desktop]: {
        paddingTop: rhythm(5),
      },
      [presets.Hd]: {
        paddingLeft: vPHd,
        paddingRight: vPHd,
        width: rhythm(22),
      },
      [presets.VHd]: {
        paddingLeft: vPVHd,
        paddingRight: vPVHd,
        width: rhythm(29),
      },
      [presets.VVHd]: {
        paddingLeft: vPVVHd,
        paddingRight: vPVVHd,
        width: rhythm(30),
      },
    }}
  >
    <h1
      css={{
        ...scale(0.8),
        color: presets.brand,
        lineHeight: 1,
        margin: 0,
        marginBottom: `1.2em`,
        padding: 0,
        [presets.Mobile]: {
          fontSize: scale(1).fontSize,
        },
        [presets.Tablet]: {
          fontSize: scale(1.2).fontSize,
        },
        [presets.Hd]: {
          fontSize: scale(1.4).fontSize,
        },
        [presets.VHd]: {
          fontSize: scale(1.75).fontSize,
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

const Masthead = () =>
  <main className="Masthead">
    <MastheadBg />
    <MastheadContent />
  </main>

export default Masthead
