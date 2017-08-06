import presets from "../utils/presets"
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
}

const MastheadBg = () =>
  <div
    className="masthead-bg"
    css={{
      ...cover,
      position: `absolute`,
      background: `#fff`,
      bottom: `auto`,
      height: `200vh`,
      overflow: `hidden`,
      zIndex: -1,
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
      viewBox="0 0 10 10"
      preserveAspectRatio="xMinYMin slice"
      className="masthead-bg-left"
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
      <polygon fill={presets.brandLighter} points="-5,-5 15,15 -5,15 " />
    </svg>
    <style>
      {`
          .masthead-bg-left-dark {
            transition: fill 100ms linear;
          }
          @media (max-width: 650px),
          (max-width: 768px) and (orientation:portrait) {
            .masthead-bg-left {
              width: calc(180% + 4vh);
            }
          }
          ${presets.Phablet} {
            .masthead-bg-left {
              width: calc(130% + 2vh);
            }
          }
          ${presets.Tablet} {
            .masthead-bg-left {
              width: calc(125% + 4vh);
            }
          }
          ${presets.Desktop}  {
            .masthead-bg-left {
              width: 110%;
            }
          }
          ${presets.Hd}  {
            .masthead-bg-left {
              width: calc(100%);
            }
          }
        `}
    </style>
    <svg
      viewBox="0 0 10 10"
      preserveAspectRatio="xMidYMin meet"
      className="masthead-bg-left"
      css={{
        ...cover,
        position: `absolute`,
        width: `calc(180% - + 4vh)`,
        height: `100%`,
        zIndex: -1,
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
          className="masthead-bg-left-dark"
          width="10000%"
          height="10000%"
          fill={presets.brand}
          transform="rotate(45 100 50) translate(0 0)"
        />
        {/*<polygon fill="blue" points="0,10 10,0 10,10" />*/}
      </svg>
    </svg>
  </div>

export default MastheadBg
