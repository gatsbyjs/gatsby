import React from "react"
import { Link } from "gatsby"

import {
  BlogIcon,
  CommunityIcon,
  DocsIcon,
  TutorialIcon,
} from "../assets/mobile-nav-icons"
import presets, { colors } from "../utils/presets"
import typography, { rhythm, scale, options } from "../utils/typography"

const MobileNavItem = ({ linkTo, label, icon }) => (
  <Link
    to={linkTo}
    css={{
      color: colors.gatsby,
      fontSize: scale(-1 / 2).fontSize,
      letterSpacing: `0.0075rem`,
      lineHeight: 1,
      padding: `${rhythm(options.blockMarginBottom / 4)} ${rhythm(
        options.blockMarginBottom
      )} ${rhythm(options.blockMarginBottom / 2)} `,
      textDecoration: `none`,
      textAlign: `center`,
    }}
  >
    <img src={icon} css={{ height: 32, display: `block`, margin: `0 auto` }} />
    <div>{label}</div>
  </Link>
)

export default () => (
  <div
    css={{
      position: `fixed`,
      display: `flex`,
      justifyContent: `space-around`,
      alignItems: `center`,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1,
      borderTop: `1px solid ${colors.ui.light}`,
      background: colors.ui.whisper,
      fontFamily: typography.options.headerFontFamily.join(`,`),
      [presets.Tablet]: {
        display: `none`,
      },
    }}
  >
    <MobileNavItem linkTo="/docs/" label="Docs" icon={DocsIcon} />
    <MobileNavItem linkTo="/tutorial/" label="Tutorial" icon={TutorialIcon} />
    <MobileNavItem
      linkTo="/community/"
      label="Community"
      icon={CommunityIcon}
    />
    <MobileNavItem linkTo="/blog/" label="Blog" icon={BlogIcon} />
  </div>
)
