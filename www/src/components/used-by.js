import React from "react"
import { rhythm } from "../utils/typography"
import {
  space,
  fontSizes,
  transition,
  colors,
  breakpoints,
  fonts,
} from "../utils/presets"
import { FormidableIcon, FabricIcon } from "../assets/logos"

const Icon = ({ icon, alt, href }) => (
  <li
    css={{
      marginRight: space[6],
      display: `inline-block`,
      padding: 0,
      height: `calc(14px + 1vw)`,
      [breakpoints.sm]: {
        marginBottom: 0,
        height: `calc(9px + 1vw)`,
        ":last-child": {
          marginRight: 0,
        },
      },
      [breakpoints.md]: {
        height: `calc(12px + 1vw)`,
      },
    }}
  >
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      css={{
        transition: `opacity ${transition.speed.fast} ${
          transition.curve.default
        }`,
        opacity: 0.9,
        "&&": {
          borderBottom: 0,
        },
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
      padding: space[8],
      paddingTop: space[5],
      paddingBottom: space[5],
      marginBottom: rhythm(3),
      transition: `padding-top ${transition.speed.fast} ${
        transition.curve.default
      }`,
      order: `3`,
      flexGrow: `1`,
      transform: `translateZ(0)`,
      [breakpoints.sm]: {
        paddingTop: rhythm(4),
        marginBottom: 0,
        paddingLeft: 0,
        flex: `0 1 auto`,
      },
      [breakpoints.lg]: {
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
        [breakpoints.sm]: {
          flexGrow: `0`,
        },
      }}
    >
      <p
        css={{
          color: colors.lilac,
          fontFamily: fonts.header,
          fontSize: fontSizes[1],
          marginBottom: 0,
          [breakpoints.sm]: {
            fontSize: fontSizes[2],
            textAlign: `right`,
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
