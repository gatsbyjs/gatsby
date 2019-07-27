/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { rhythm } from "../utils/typography"
import { mediaQueries } from "../gatsby-plugin-theme-ui"
import { FormidableIcon, FabricIcon } from "../assets/logos"

const Icon = ({ icon, alt, href }) => (
  <li
    sx={{
      mr: 6,
      display: `inline-block`,
      p: 0,
      height: `calc(14px + 1vw)`,
      [mediaQueries.sm]: {
        mb: 0,
        height: `calc(9px + 1vw)`,
        ":last-child": {
          marginRight: 0,
        },
      },
      [mediaQueries.md]: {
        height: `calc(12px + 1vw)`,
      },
    }}
  >
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        transition: t =>
          `opacity ${t.transition.speed.fast} ${t.transition.curve.default}`,
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
        sx={{
          m: 0,
          height: `100%`,
        }}
      />
    </a>
  </li>
)

const UsedBy = () => (
  <div
    className="Masthead-usedBy"
    sx={{
      display: `flex`,
      p: 8,
      py: 5,
      marginBottom: 12,
      transition: t =>
        `padding-top ${t.transition.speed.fast} ${t.transition.curve.default}`,
      order: `3`,
      flexGrow: `1`,
      transform: `translateZ(0)`,
      [mediaQueries.sm]: {
        paddingTop: rhythm(4),
        marginBottom: 0,
        paddingLeft: 0,
        flex: `0 1 auto`,
      },
      [mediaQueries.lg]: {
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
        [mediaQueries.sm]: {
          flexGrow: `0`,
        },
      }}
    >
      <p
        sx={{
          color: `lilac`,
          fontFamily: `header`,
          fontSize: 1,
          mb: 0,
          [mediaQueries.sm]: {
            fontSize: 2,
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
