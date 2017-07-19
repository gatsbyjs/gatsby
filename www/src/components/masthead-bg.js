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
      viewBox="0 0 10 10"
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
      <polygon fill={presets.brandLighter} points="-5,-5 15,15 -5,15 " />
    </svg>
    <style>
      {`
          @media (max-width: 650px) {
            .Masthead-bg-left {
              width: calc(200% + 4vh);
            }
          }
          ${presets.Tablet} {
            .Masthead-bg-left {
              width: calc(125% + 4vh);
            }
          }
          ${presets.Desktop}  {
            .Masthead-bg-left {
              width: 110%;
            }
          }
          ${presets.Hd}  {
            .Masthead-bg-left {
              width: 100%;
            }
          }
        `}
    </style>
    <svg
      viewBox="0 0 10 10"
      preserveAspectRatio="xMidYMin meet"
      className="Masthead-bg-left"
      css={{
        ...cover,
        position: `absolute`,
        width: `calc(200% - 50vw - 2vh)`,
        height: `100%`,
        zIndex: -1,
        transition: `width 100ms linear`,
      }}
    >
      <svg
        x="-15%"
        y="-5%"
        style={{
          overflow: `visible`,
        }}
      >
        <rect
          width="1000%"
          height="1000%"
          fill={presets.brand}
          transform="rotate(45 100 50) translate(0 0)"
        />
        {/*<polygon fill="blue" points="0,10 10,0 10,10" />*/}
      </svg>
    </svg>
  </div>

export default MastheadBg
