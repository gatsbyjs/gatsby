import React from "react"
import { Link } from "gatsby"
import styled, { css } from "react-emotion"
import { MdLaunch } from "react-icons/md"

import { rhythm, options } from "../utils/typography"
import presets, { colors } from "../utils/presets"

const linkStyle = {
  fontFamily: options.headerFontFamily.join(`,`),
  fontWeight: 700,
  letterSpacing: `.005em`,
  position: `relative`,
  transition: `all 200ms cubic-bezier(.17, .67, .83, .67)`,
  whiteSpace: `nowrap`,
  "@media (-webkit-min-device-pixel-ratio:0)": {
    backgroundImage: `linear-gradient(45deg, #EB4D9C, #D33024, #E48233, #F4E24D, #B4DC48, #54B2EA, ${
      colors.gatsby
    } 50%)`,
    backgroundPosition: `100% 0`,
    backgroundSize: `200% 200%`,
    color: `rgba(102, 51, 153, 1)`,
    WebkitBackgroundClip: `text`,
    "&:hover": {
      backgroundPosition: `0 0`,
      color: `rgba(102, 51, 153, 0) !important`,
      WebkitTextFillColor: `transparent`,
    },
  },
}

const assignActiveStyles = ({ isPartiallyCurrent }) =>
  isPartiallyCurrent
    ? {
        className: css({
          ...linkStyle,
          color: `rgba(0, 0, 0, 1) !important`,
          "&&": {
            "&:before": {
              backgroundColor: `#000`,
              bottom: 0,
              content: `""`,
              height: 2,
              left: 0,
              position: `absolute`,
              right: 0,
              width: 12,
            },
            [presets.Desktop]: {
              "&:before": {
                height: 4,
                width: 18,
              },
            },
          },

          "&:hover": {
            backgroundPosition: `100% 0 !important`,
            color: `initial !important`,
            WebkitTextFillColor: `initial !important`,
          },
        }),
      }
    : { className: css({ "&&": { ...linkStyle } }) }

const SiteTitle = styled(`h1`)({
  lineHeight: 1,
  margin: 0,
  position: `fixed`,
  left: -44,
  top: 128,
  fontSize: 20,
  transform: `rotate(90deg)`,
  [presets.Tablet]: {
    zIndex: presets.zIndex.overlay + 1,
  },
})

const Nav = styled(`nav`)({
  background: `#fff`,
  marginLeft: -20,
  marginRight: -20,
  overflowX: `auto`,
  paddingBottom: 20,
  paddingLeft: 20,
  paddingTop: 20,
  position: `relative`,
  zIndex: presets.zIndex.raised,
  [presets.Tablet]: {
    overflowX: `initial`,
    marginLeft: 0,
    marginRight: 0,
    paddingLeft: 0,
    paddingTop: 0,
  },
})

const NavList = styled(`ul`)({
  margin: 0,
  listStyle: `none`,
  whiteSpace: `nowrap`,
  [presets.Tablet]: {
    maxWidth: 580,
    marginLeft: -200,
    whiteSpace: `initial`,
  },
})

const NavListItem = styled(`li`)({
  display: `inline`,
  [presets.Phablet]: { fontSize: 20 },
  [presets.Tablet]: { fontSize: 24 },
  [presets.Desktop]: { fontSize: 28 },
})

const NavItem = ({ title, to }) => (
  <NavListItem
    css={{
      "&:after": {
        color: colors.gatsby,
        content: `" ╱ "`,
        fontWeight: 300,
        opacity: 0.5,
        fontSize: `50%`,
        position: `relative`,
        bottom: 3,
        padding: `0 ${rhythm(options.blockMarginBottom / 4)}`,
      },
      "&:last-child:after": {
        display: `none`,
      },
    }}
  >
    <Link to={to} getProps={assignActiveStyles}>
      {title}
    </Link>
  </NavListItem>
)

const ExternalLinkIcon = styled(MdLaunch)({
  backgroundImage: `none`,
  bottom: `-0.2em`,
  color: colors.gatsby,
  fontSize: `75%`,
  position: `relative`,
  verticalAlign: `baseline`,
  [presets.Tablet]: {
    bottom: `-0.15em`,
    fontSize: `60%`,
  },
})

const Navigation = () => (
  <header>
    <SiteTitle>
      <Link to="/" css={{ "&&": { ...linkStyle } }}>
        Using Gatsby Image
      </Link>
    </SiteTitle>
    <Nav aria-label="Primary Navigation">
      <NavList>
        <NavItem to="/blur-up/" title="Blur Up" />
        <NavItem to="/background-color/" title="Background Color" />
        <NavItem to="/traced-svg/" title="Traced SVG" />
        <NavItem to="/prefer-webp/" title="WebP" />
        <NavListItem>
          <a
            href="https://www.gatsbyjs.org/packages/gatsby-image/"
            css={{ "&&": { ...linkStyle } }}
          >
            Docs
            {` `}
            <ExternalLinkIcon />
          </a>
        </NavListItem>
      </NavList>
    </Nav>
  </header>
)

export default Navigation
