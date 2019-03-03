import React from "react"
import typography, { rhythm, scale } from "../utils/typography"
import presets from "../utils/presets"
import { FormidableIcon, FabricIcon } from "../assets/logos"

const Icon = ({ icon, alt, href }) => (
  <li
    css={{
      marginRight: rhythm(3 / 4),
      display: `inline-block`,
      padding: 0,
      height: `calc(14px + 1vw)`,
      [presets.Sm]: {
        marginBottom: 0,
        height: `calc(9px + 1vw)`,
        ":last-child": {
          marginRight: 0,
        },
      },
      [presets.Md]: {
        height: `calc(12px + 1vw)`,
      },
    }}
  >
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      css={{
        borderBottom: `0 !important`,
        boxShadow: `none !important`,
        background: `none !important`,
        transition: `opacity ${presets.animation.speedFast} ${
          presets.animation.curveDefault
        }`,
        opacity: 0.9,
        ":hover": {
          opacity: 1,
        },
        ":active": {
          opacity: 0.8,
        },
      }}
    >
      <img
        src={icon}
        alt={alt}
        css={{
          margin: 0,
          height: `100%`,
        }}
      />
    </a>
  </li>
)

const UsedBy = () => (
  <div
    className="Masthead-usedBy"
    css={{
      display: `flex`,
      padding: rhythm(presets.gutters.default),
      paddingTop: rhythm(1),
      paddingBottom: rhythm(1),
      marginBottom: rhythm(3),
      transition: `padding-top ${presets.animation.speedFast} ${
        presets.animation.curveDefault
      }`,
      order: `3`,
      flexGrow: `1`,
      transform: `translateZ(0)`,
      [presets.Sm]: {
        paddingTop: rhythm(4),
        marginBottom: 0,
        paddingLeft: 0,
        flex: `0 1 auto`,
      },
      [presets.Lg]: {
        paddingTop: rhythm(5),
      },
    }}
  >
    <div
      css={{
        marginLeft: `auto`,
        flexGrow: `1`,
        flexShrink: `1`,
        alignSelf: `flex-end`,
        transform: `translateZ(0)`,
        [presets.Sm]: {
          flexGrow: `0`,
        },
      }}
    >
      <p
        css={{
          color: presets.colors.lilac,
          letterSpacing: `0.02em`,
          fontFamily: typography.options.headerFontFamily.join(`,`),
          fontSize: scale(-2 / 5).fontSize,
          marginBottom: 0,
          [presets.Sm]: {
            fontSize: scale(-2 / 5).fontSize,
            textAlign: `right`,
          },
          [presets.Lg]: {
            fontSize: scale(-1 / 5).fontSize,
          },
        }}
      >
        Used by
      </p>
      <ul
        css={{
          margin: 0,
          listStyle: `none`,
          opacity: 0.75,
        }}
      >
        <Icon
          icon={FabricIcon}
          alt="Fabric"
          href="https://meetfabric.com/careers"
        />
        <Icon
          icon={FormidableIcon}
          alt="Formidable"
          href="https://formidable.com"
        />
      </ul>
    </div>
  </div>
)

export default UsedBy
