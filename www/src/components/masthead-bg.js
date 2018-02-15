import React from "react"
import presets, { colors } from "../utils/presets"
import { rhythm, scale, options } from "../utils/typography"
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
  position: `absolute`,
}

const MastheadBg = () => (
  <div
    className="masthead-bg"
    css={{
      ...cover,
      overflow: `hidden`,
      zIndex: -1,
    }}
  >
    <div
      className="masthead-bg-left-fill"
      css={{
        ...cover,
        right: `auto`,
        width: vPOff,
        zIndex: -10,
        background: colors.ui.light,
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
      viewBox="0 0 10 10"
      preserveAspectRatio="xMinYMin slice"
      className="masthead-bg-left"
      css={{
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
      <polygon fill={colors.ui.light} points="-5,-5 15,15 -5,15 " />
    </svg>
    <style>
      {`
          .masthead-bg-right-light {
            fill: ${colors.gatsby};
          }
          @media (max-width: 650px),
          (max-width: 768px) and (orientation:portrait) {
            .masthead-bg-right {
              width: calc(160% + 4vh);
            }
          }
          ${presets.Phablet} {
            .masthead-bg-right {
              width: calc(130% + 2vh);
              top: 0;
            }
          }
          ${presets.Tablet} {
            .masthead-bg-right {
              width: calc(125% + 4vh);
            }
          }
          ${presets.Desktop}  {
            .masthead-bg-right {
              width: 110%;
            }

            .masthead-bg-right-light {
              fill: ${colors.lilac};
            }
          }
          ${presets.Hd}  {
            .masthead-bg-right {
              width: calc(100%);
            }
          }
        `}
    </style>
    <svg
      viewBox="0 0 10 10"
      preserveAspectRatio="xMidYMin meet"
      className="masthead-bg-right"
      css={{
        ...cover,
        width: `calc(180% - + 4vh)`,
        height: `100%`,
        zIndex: -1,
        top: `2%`,
        //transition: `width 100ms linear`,
      }}
    >
      <svg
        x="-15%"
        y="-10%"
        style={{
          overflow: `visible`,
        }}
      >
        <rect
          className="masthead-bg-right-light"
          width="10000%"
          height="10000%"
          fill={colors.lilac}
          transform="rotate(45 100 50) translate(0 0)"
        />
        <rect
          className="masthead-bg-left-dark"
          width="10000%"
          height="10000%"
          fill={colors.gatsby}
          transform="rotate(45 100 50) translate(1.25 0)"
        />
        {/*<polygon fill="blue" points="0,10 10,0 10,10" />*/}
      </svg>
    </svg>
  </div>
)

export default MastheadBg
