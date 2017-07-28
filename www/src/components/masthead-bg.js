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

const MastheadBgRightPoly = ({ fill }) =>
  <polygon fill={fill} points="-27,105 83,-5 130,-5 130,105 " />

const MastheadBgRightGroup = ({
  brightOff,
  darkOff,
  cssClassName,
  brightBg,
}) => {
  const bg = brightBg ? brightBg : presets.brandLight

  return (
    <g className={`Masthead-bg-right-group ${cssClassName}`}>
      <g className="bright" transform={`translate(${brightOff})`}>
        <MastheadBgRightPoly fill={bg} />
      </g>
      <g className="dark" transform={`translate(${darkOff})`}>
        <MastheadBgRightPoly fill={presets.brandDark} />
      </g>
    </g>
  )
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
          .Masthead-bg-right--sm-landscape,
          .Masthead-bg-right--lg,
          .Masthead-bg-right--lg-landscape {
            display: none;
          }
          @media (min-aspect-ratio: 1/1) {
            .Masthead-bg-right--sm-landscape {
              display: block;
            }
            .Masthead-bg-right--sm,
            .Masthead-bg-right--lg,
            .Masthead-bg-right--lg-landscape {
              display: none;
            }
          }
          @media (min-aspect-ratio: 1/1) and ${presets.desktop},
                 (max-aspect-ratio: 1/1) and ${presets.tablet} {
            .Masthead-bg-right--lg {
              display: block;
            }
            .Masthead-bg-right--lg-landscape {
              display: none;
            }
          }
          @media (min-aspect-ratio: 1/1) and ${presets.hd} {
            .Masthead-bg-right--lg-landscape {
              display: block;
            }
            .Masthead-bg-right--lg {
              display: none;
            }
          }
        `}
      </style>
      <MastheadBgRightGroup
        brightOff="20,0"
        darkOff="40,0"
        //brightBg="yellow"
        cssClassName="Masthead-bg-right--sm"
      />
      <MastheadBgRightGroup
        brightOff="5,0"
        darkOff="30,0"
        //brightBg="orange"
        cssClassName="Masthead-bg-right--sm-landscape"
      />
      <MastheadBgRightGroup
        brightOff="-10,0"
        darkOff="5,0"
        //brightBg="red"
        cssClassName="Masthead-bg-right--lg"
      />
      <MastheadBgRightGroup
        brightOff="-15,0"
        darkOff="0,0"
        //brightBg="purple"
        cssClassName="Masthead-bg-right--lg-landscape"
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

export default MastheadBg
