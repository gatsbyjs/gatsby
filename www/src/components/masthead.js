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

const MastheadBgRightPoly = ({ fill }) =>
  <polygon fill={fill} points="-27,105 83,-5 130,-5 130,105 " />

const MastheadBgRightGroup = ({ brightOff, darkOff, cssClassName }) =>
  <g className={`Masthead-bg-right-group ${cssClassName}`}>
    <g className="bright" transform={`translate(${brightOff})`}>
      <MastheadBgRightPoly fill={presets.brandLight} />
    </g>
    <g className="dark" transform={`translate(${darkOff})`}>
      <MastheadBgRightPoly fill={presets.brandDark} />
    </g>
  </g>

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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className="Masthead-bg-right"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMin slice"
      css={{
        ...cover,
        position: `absolute`,
        width: `100%`,
        height: `100%`,
        zIndex: -1,
      }}
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
      {/* :-/ */}
      {/* works for phones */}
      <MastheadBgRightGroup
        brightOff="20,0"
        darkOff="35,0"
        cssClassName="Masthead-bg-right--sm"
      />
      {/* works for ipad/pro portrait, but not for any phone in portrait mode */}
      {/* <MastheadBgRightGroup brightOff="-5,0" darkOff="15,0" /> *}
      {/* works for large screens */}
      <MastheadBgRightGroup
        brightOff="-10,0"
        darkOff="5,0"
        cssClassName="Masthead-bg-right--lg"
      />
    </svg>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 100 100"
      xmlSpace="preserve"
      preserveAspectRatio="xMinYMin slice"
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
        width: `100%`,
        height: `100%`,
      }}
    >
      <polygon fill={presets.brandLighter} points="-50,-50 150,150 -50,150 " />
    </svg>
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
