import React from "react"
import { Link } from "gatsby"
import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { MdLink } from "react-icons/md"
import { scale, rhythm, options } from "../utils/typography"
import { mq, elevation, gutter, colors, animation } from "../utils/presets"

const linkStyle = css`
  font-family: ${options.headerFontFamily.join(`,`)};
  font-weight: 700;
  letter-spacing: 0.005em;
  position: relative;
  transition: ${animation.speedDefault} ${animation.curveExpo};
  white-space: nowrap;

  @media (-webkit-min-device-pixel-ratio: 0) {
    background-image: linear-gradient(
      45deg,
      #eb4d9c,
      #d33024,
      #e48233,
      #f4e24d,
      #b4dc48,
      #54b2ea,
      ${colors.gatsby} 50%
    );
    background-size: 200% 200%;
    color: rgba(102, 51, 153, 1);
    -webkit-background-clip: text;

    &:hover {
      background-position: 0 0;
      color: rgba(102, 51, 153, 0);
    }
  }
`

const assignActiveStyles = ({ isPartiallyCurrent }) =>
  isPartiallyCurrent
    ? {
        className: css`
          ${linkStyle};

          && {
            color: rgba(0, 0, 0, 1);

            &:before {
              background-color: #000;
              bottom: -0.0625em;
              content: "";
              height: 0.125em;
              left: 0;
              position: absolute;
              right: 0;
              width: 0.65em;
            }

            &:hover {
              background-position: 100% 0;
              color: initial;
            }
          }
        `,
      }
    : {
        className: css`
          ${linkStyle};
        `,
      }

const SiteTitle = styled(`h1`)`
  margin: 0;
  position: fixed;
  left: -2.75rem;
  top: 8rem;
  font-size: ${scale(1).fontSize};
  line-height: 1;
  transform: rotate(90deg);

  ${mq.tablet} {
    z-index: ${elevation.overlay + 1};
  }
`

const Nav = styled(`nav`)`
  background: #fff;
  margin-left: -${gutter.default};
  margin-right: -${gutter.default};
  overflow-x: auto;
  padding-bottom: ${gutter.default};
  padding-left: ${gutter.default};
  padding-top: ${gutter.default};
  position: relative;
  z-index: ${elevation.raised};

  ${mq.tablet} {
    margin-left: 0;
    margin-right: 0;
    overflow-x: initial;
    padding-left: 0;
    padding-top: 0;
  }
`

const NavList = styled(`ul`)`
  margin: 0;
  list-style: none;
  white-space: nowrap;

  ${mq.tablet} {
    max-width: 30rem;
    margin-left: -7.5rem;
    white-space: initial;
  }
`

const NavListItem = styled(`li`)`
  display: inline;

  ${mq.phablet} {
    font-size: ${scale(1).fontSize};
  }
  ${mq.tablet} {
    font-size: ${scale(2).fontSize};
  }
  ${mq.xl} {
    font-size: ${scale(3).fontSize};
  }
`

const NavItem = ({ title, to }) => (
  <NavListItem
    css={css`
      &:after {
        color: ${colors.gatsby};
        content: " ╱ ";
        font-weight: 300;
        opacity: 0.5;
        font-size: 50%;
        position: relative;
        bottom: 0.25rem;
        padding: 0 ${rhythm(options.blockMarginBottom / 4)};
      }

      &:last-child:after {
        display: none;
      }
    `}
  >
    <Link to={to} getProps={assignActiveStyles}>
      {title}
    </Link>
  </NavListItem>
)

const ExternalLinkIcon = styled(MdLink)`
  background-image: none;
  bottom: -0.2em;
  color: ${colors.gatsby};
  font-size: 75%;
  position: relative;
  vertical-align: baseline;

  ${mq.tablet} {
    bottom: -0.15em;
    font-size: 60%;
  }
`

const Navigation = () => (
  <header>
    <SiteTitle>
      <Link
        to="/"
        css={`
          ${linkStyle};
        `}
      >
        Using Gatsby Image
      </Link>
    </SiteTitle>
    <Nav aria-label="Primary Navigation">
      <NavList>
        <NavItem to="/dominant-color/" title="Dominant Color" />
        <NavItem to="/blur-up/" title="Blur Up" />
        <NavItem to="/traced-svg/" title="Traced SVG" />
        <NavItem to="/prefer-webp/" title="WebP" />
        <NavItem to="/static-images/" title="StaticImage" />
        <NavItem to="/art-direction/" title="Art Direction" />
        <NavListItem>
          <a
            href="https://www.gatsbyjs.com/plugins/gatsby-plugin-image/"
            css={css`
              ${linkStyle};
            `}
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
