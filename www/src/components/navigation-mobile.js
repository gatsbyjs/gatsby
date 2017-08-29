import React from "react"
import Link from "gatsby-link"
import CodeIcon from "react-icons/lib/go/code"
import DocumentIcon from "react-icons/lib/go/file-text"
import PencilIcon from "react-icons/lib/go/pencil"
import PersonIcon from "react-icons/lib/md/person"

import colors from "../utils/colors"
import presets from "../utils/presets"
import typography, { rhythm, scale } from "../utils/typography"

const MobileNavItem = ({ linkTo, title, children }) =>
  <Link
    to={linkTo}
    css={{
      //color: presets.brand,
      textDecoration: `none`,
      textAlign: `center`,
      textTransform: `uppercase`,
      letterSpacing: `0.07em`,
      fontSize: scale(-1 / 2).fontSize,
    }}
  >
    {children}
    <div css={{ opacity: 0.8, lineHeight: 1, marginTop: rhythm(1 / 8) }}>
      {title}
    </div>
  </Link>

export default () =>
  <div
    css={{
      lineHeight: 2,
      position: `fixed`,
      display: `flex`,
      justifyContent: `space-around`,
      alignItems: `center`,
      bottom: 0,
      left: 0,
      right: 0,
      height: rhythm(2.3),
      background: presets.veryLightPurple,
      borderTop: `1px solid ${colors.b[0]}`,
      background: `#fcfaff`,
      fontFamily: typography.options.headerFontFamily.join(`,`),
      [presets.Tablet]: {
        display: `none`,
      },
    }}
  >
    <MobileNavItem linkTo="/docs/" title="Docs">
      <DocumentIcon
        css={{
          fontSize: rhythm(0.7),
        }}
      />
    </MobileNavItem>
    <MobileNavItem linkTo="/tutorial/" title="Tutorial">
      <CodeIcon
        css={{
          fontSize: rhythm(0.8),
        }}
      />
    </MobileNavItem>
    <MobileNavItem linkTo="/community/" title="Community">
      <PersonIcon
        css={{
          fontSize: rhythm(5 / 8),
          position: `relative`,
          right: -4,
        }}
      />
      <PersonIcon
        css={{
          fontSize: rhythm(5 / 8),
        }}
      />
      <PersonIcon
        css={{
          fontSize: rhythm(5 / 8),
          position: `relative`,
          left: -4,
        }}
      />
    </MobileNavItem>
    <MobileNavItem linkTo="/blog/" title="Blog">
      <PencilIcon
        css={{
          fontSize: rhythm(0.7),
        }}
      />
    </MobileNavItem>
  </div>
