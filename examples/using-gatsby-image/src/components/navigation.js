import React from "react"
import { Link } from "gatsby"
import styled, { css } from "react-emotion"
import { MdLaunch } from "react-icons/md"

import { rhythm, options } from "../utils/typography"
import presets, { colors } from "../utils/presets"

const linkFontSize = {
  [presets.Phablet]: {
    fontSize: 20,
  },
  [presets.Tablet]: {
    fontSize: 24,
  },
  [presets.Desktop]: {
    fontSize: 28,
  },
}

const linkStyle = {
  fontFamily: options.headerFontFamily.join(`,`),
  letterSpacing: `.005em`,
  transition: `all 200ms cubic-bezier(.17, .67, .83, .67)`,
  whiteSpace: `nowrap`,
  fontWeight: 700,
  position: `relative`,
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
              content: `""`,
              position: `absolute`,
              bottom: 0,
              left: 0,
              right: 0,
              width: 12,
              height: 2,
              backgroundColor: `#000`,
            },
            [presets.Desktop]: {
              "&:before": {
                width: 18,
                height: 4,
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

const Header = styled(`header`)({
  "& li": {
    backgroundImage: `none`,
    paddingLeft: `0 !important`,
  },
})

const Nav = styled(`nav`)({
  background: `#fff`,
  overflowX: `auto`,
  paddingBottom: 20,
  paddingTop: 20,
  position: `relative`,
  zIndex: presets.zIndex.header,
  marginLeft: -20,
  marginRight: -20,
  paddingLeft: 20,
  [presets.Tablet]: {
    overflowX: `initial`,
    marginLeft: 0,
    marginRight: 0,
    paddingLeft: 0,
  },
})

const SiteTitle = styled(`h1`)({
  marginBottom: 0,
  position: `fixed`,
  left: -44,
  top: 128,
  fontSize: 20,
  transform: `rotate(90deg)`,
  [presets.Desktop]: {
    zIndex: 100,
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

const NavItem = ({ title, to }) => (
  <li
    css={{
      display: `inline`,
      ...linkFontSize,
      "&:after": {
        color: `#639`,
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
  </li>
)

const Navigation = () => (
  <Header>
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
        <li
          css={{
            ...linkFontSize,
            display: `inline`,
          }}
        >
          <a
            href="https://www.gatsbyjs.org/packages/gatsby-image/"
            css={{ "&&": { ...linkStyle } }}
          >
            Docs
            {` `}
            <MdLaunch
              css={{
                position: `relative`,
                bottom: `-0.2em`,
                verticalAlign: `baseline`,
                backgroundImage: `none`,
                color: colors.gatsby,
                fontSize: `75%`,
                [presets.Tablet]: {
                  bottom: `-0.15em`,
                  fontSize: `60%`,
                },
              }}
            />
          </a>
        </li>
      </NavList>
    </Nav>
  </Header>
)

export default Navigation
