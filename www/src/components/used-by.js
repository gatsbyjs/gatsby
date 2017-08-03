import { rhythm, scale, options } from "../utils/typography"
import presets from "../utils/presets"
import { vP, vPHd, vPVHd, vPVVHd } from "../components/gutters"
import { FormidableIcon, FabricIcon, SegmentIcon } from "../assets/logos"

const Icon = ({ icon }) =>
  <li
    css={{
      marginRight: rhythm(3 / 4),
      display: `inline-block`,
      padding: 0,
      ":last-child": {
        marginRight: 0,
      },
    }}
  >
    <img
      src={icon}
      css={{
        margin: 0,
        verticalAlign: `text-bottom`,
        height: `1em`,
        [presets.Phablet]: {
          height: `20px`,
        },
        [presets.Desktop]: {
          height: `24px`,
        },
        [presets.VHd]: {
          height: `28px`,
        },
      }}
    />
  </li>

const UsedBy = () =>
  <div
    className="Masthead-usedBy"
    css={{
      display: `flex`,
      padding: vP,
      paddingTop: rhythm(1),
      paddingBottom: rhythm(1),
      marginBottom: rhythm(3),
      transition: `padding-top ${presets.animation.speedFast} ${presets
        .animation.curveDefault}`,
      order: `3`,
      flexGrow: `1`,
      [presets.Tablet]: {
        paddingTop: rhythm(4),
        marginBottom: 0,
        paddingLeft: 0,
        flex: `0 1 auto`,
        order: `0`,
      },
      [presets.Desktop]: {
        paddingTop: rhythm(5),
      },
      [presets.Hd]: {
        paddingLeft: vPHd,
        paddingRight: vPHd,
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
    <div
      css={{
        marginLeft: `auto`,
        flexGrow: `1`,
        flexShrink: `1`,
        alignSelf: `flex-end`,
        textAlign: `center`,
        "@media (max-height: 650px)": {
          textAlign: `right`,
        },
        [presets.Tablet]: {
          flexGrow: `0`,
        },
      }}
    >
      <p
        css={{
          color: `#fff`,
          letterSpacing: `0.02em`,
          fontFamily: `Futura-pt`,
          marginBottom: 0,
          fontSize: scale(-2 / 5).fontSize,
          "@media (max-height: 650px)": {
            textAlign: `right`,
          },
          [presets.Tablet]: {
            fontSize: scale(-1 / 5).fontSize,
            textAlign: `right`,
          },
          [presets.Hd]: {
            fontSize: scale(0 / 5).fontSize,
          },
        }}
      >
        Used by
      </p>
      <ul css={{ margin: 0, listStyle: `none`, opacity: 0.75 }}>
        <Icon icon={FabricIcon} />
        <Icon icon={SegmentIcon} />
        <Icon icon={FormidableIcon} />
      </ul>
    </div>
  </div>

export default UsedBy
