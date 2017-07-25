import Link from "gatsby-link"
import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"

import { rhythm, scale, options } from "../utils/typography"
import presets from "../utils/presets"
import CtaButton from "./cta-button"
import FuturaParagraph from "./futura-paragraph"
import { vP, vPHd, vPVHd, vPVVHd } from "../components/gutters"

const vPOff = rhythm(presets.gutters.default - presets.logoOffset)
const vPHdOff = rhythm(presets.gutters.HdR - presets.logoOffset)
const vPVHdOff = rhythm(presets.gutters.VHdR - presets.logoOffset)
const vPVVHdOff = rhythm(presets.gutters.VVHdR - presets.logoOffset)

const cover = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
}

const MastheadBg = () =>
  <div
    className="Masthead-bg"
    css={{
      ...cover,
      position: `fixed`,
      zIndex: -1,
      background: `white`,
    }}
  >
    <div
      css={{
        ...cover,
        position: `absolute`,
        right: `auto`,
        width: vPOff,
        zIndex: -10,
        background: presets.brandLighter,
        [presets.Hd]: {
          width: vPHdOff,
        },
        [presets.VHd]: {
          width: vPVHdOff,
        },
        [presets.VVHd]: {
          width: vPVVHdOff,
        },
      }}
    />
    <div
      className="Masthead-bg-right"
      css={{
        ...cover,
        position: `absolute`,
        width: `100%`,
        height: `100%`,
        zIndex: -1,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 400 400"
        preserveAspectRatio="xMinYMin slice"
        style={{ width: `100%`, height: `100%` }}
      >
        <style type="text/css">
          {`
            .Masthead-bg-right--lg {
              display: none;
            }
            @media screen and (min-width: 960px) and (min-height: 600px) {
              .Masthead-bg-right--lg {
                display: block;
              }
            }
          `}
        </style>
        <polygon
          fill={presets.brandLight}
          className="Masthead-bg-right--sm"
          points="-250,571.8 436.8,-115 1070,-115 1070,571.8 "
        />
        <polygon
          fill={presets.brandDark}
          className="Masthead-bg-right--sm"
          points="-130,571.8 556.8,-115 1586.2,-115 1586.2,571.8 "
        />
        <polygon
          fill={presets.brandLight}
          className="Masthead-bg-right--lg"
          points="-190,460 496.8,-226.8 1130,-226.8 1130,460 "
        />
        <polygon
          fill={presets.brandDark}
          className="Masthead-bg-right--lg"
          points="-130,460 556.8,-226.8 1586.2,-226.8 1586.2,460 "
        />
      </svg>
    </div>
    <div
      className="Masthead-bg-left"
      css={{
        position: `absolute`,
        ...cover,
        left: vPOff,
        zIndex: -2,
        [presets.Hd]: {
          left: vPHdOff,
        },
        [presets.VHd]: {
          left: vPVHdOff,
        },
        [presets.VVHd]: {
          left: vPVVHdOff,
        },
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 10000 10000"
        xmlSpace="preserve"
        preserveAspectRatio="xMinYMin slice"
        style={{ width: `100%`, height: `100%` }}
      >
        <polygon
          className="st9"
          fill={presets.brandLighter}
          points="-5000,-5000 15000,15000 -5000,15000 "
        />
      </svg>
    </div>
  </div>

const MastheadContent = () =>
  <div
    className="Masthead-content"
    css={{
      padding: vP,
      paddingTop: rhythm(4),
      paddingBottom: rhythm(3),
      width: rhythm(14),
      [presets.Phablet]: {
        width: rhythm(17),
      },
      [presets.Desktop]: {
        width: rhythm(17),
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
