import React from "react"
import Link from "gatsby-link"
import DocumentIcon from "react-icons/lib/go/file-text"
import CodeIcon from "react-icons/lib/go/code"
import PencilIcon from "react-icons/lib/go/pencil"
import PersonIcon from "react-icons/lib/md/person"
import GithubIcon from "react-icons/lib/go/mark-github"
import TwitterIcon from "react-icons/lib/fa/twitter"
import Helmet from "react-helmet"

import logo from "../gatsby-negative.svg"
import typography, { rhythm, scale } from "../utils/typography"
import SidebarBody from "../components/sidebar-body"
import DiscordIcon from "../components/discord"
import tutorialSidebar from "../pages/docs/tutorial-links.yml"
import docsSidebar from "../pages/docs/doc-links.yaml"
import presets from "../utils/presets"
import colors from "../utils/colors"
import { vP, vPHd, vPVHd, vPVVHd } from "../components/gutters"

import "../css/prism-coy.css"

// Import Futura PT typeface
import "../fonts/Webfonts/futurapt_book_macroman/stylesheet.css"
import "../fonts/Webfonts/futurapt_bookitalic_macroman/stylesheet.css"
import "../fonts/Webfonts/futurapt_demi_macroman/stylesheet.css"
import "../fonts/Webfonts/futurapt_demiitalic_macroman/stylesheet.css"

// Other fonts
import "typeface-spectral"
import "typeface-space-mono"

module.exports = React.createClass({
  propTypes() {
    return {
      children: React.PropTypes.any,
    }
  },
  render() {
    const isHomepage = this.props.location.pathname == `/`
    const headerHeight = `3.5rem`
    const gutters = isHomepage
      ? {
          paddingLeft: vP,
          paddingRight: vP,
          paddingTop: rhythm(1.5),
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
        }
      : {}
    const sidebarStyles = {
      borderRight: `1px solid ${colors.b[0]}`,
      backgroundColor: presets.sidebar,
      float: `left`,
      width: rhythm(10),
      display: `none`,
      position: `fixed`,
      overflowY: `auto`,
      height: `calc(100vh - ${headerHeight})`,
      WebkitOverflowScrolling: `touch`,
      "::-webkit-scrollbar": {
        width: `6px`,
        height: `6px`,
      },
      "::-webkit-scrollbar-thumb": {
        background: presets.lightPurple,
      },
      "::-webkit-scrollbar-track": {
        background: presets.veryLightPurple,
      },
    }
    const navItemStyles = {
      ...scale(-1 / 5),
      boxSizing: `border-box`,
      display: `inline-block`,
      color: `inherit`,
      textDecoration: `none`,
      textTransform: `uppercase`,
      letterSpacing: `0.03em`,
      lineHeight: `calc(${headerHeight} - 4px)`,
      padding: `4px ${rhythm(0.5)} 0`,
      position: `relative`,
      top: 0,
      transition: `color .15s ease-out`,
      "&:hover": {
        opacity: 0.8,
      },
    }
    const NavItem = ({ linkTo, children }) =>
      <li
        css={{
          display: `inline-block`,
          margin: 0,
        }}
      >
        <Link to={linkTo} css={navItemStyles}>
          {children}
        </Link>
      </li>
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
    const socialIconsStyles = {
      color: presets.brandLight,
      [presets.Phablet]: {
        color: isHomepage ? presets.brandLighter : false,
      },
    }

    return (
      <div>
        <Helmet
          defaultTitle={`GatsbyJS`}
          titleTemplate={`%s | GatsbyJS`}
          meta={[
            {
              name: `twitter:site`,
              content: `@gatsbyjs`,
            },
            {
              name: `og:type`,
              content: `website`,
            },
            {
              name: `og:site_name`,
              content: `GatsbyJS`,
            },
          ]}
        />
        <div
          css={{
            borderBottom: `1px solid ${presets.veryLightPurple}`,
            borderBottomColor: isHomepage
              ? `transparent`
              : `${presets.veryLightPurple}`,
            backgroundColor: isHomepage
              ? `rgba(255,255,255,0)`
              : `rgba(255,255,255,0.975)`,
            position: isHomepage ? `absolute` : false,
            height: headerHeight,
            zIndex: `1`,
            left: 0,
            right: 0,
            [presets.Tablet]: {
              position: isHomepage ? `absolute` : `fixed`,
            },
          }}
        >
          <div
            css={{
              //maxWidth: rhythm(presets.maxWidth),
              margin: `0 auto`,
              paddingLeft: rhythm(3 / 4),
              paddingRight: rhythm(3 / 4),
              ...gutters,
              transition: `padding .1s ease-out`,
              fontFamily: typography.options.headerFontFamily.join(`,`),
              display: `flex`,
              alignItems: `center`,
              width: `100%`,
              height: `100%`,
            }}
          >
            <Link
              to="/"
              css={{
                color: `inherit`,
                display: `inline-block`,
                textDecoration: `none`,
                marginRight: rhythm(0.5),
              }}
            >
              <img
                src={logo}
                css={{
                  display: `inline-block`,
                  height: rhythm(1.2),
                  width: rhythm(1.2),
                  margin: 0,
                  marginRight: rhythm(2 / 4),
                  verticalAlign: `middle`,
                }}
              />
              <h1
                css={{
                  ...scale(2 / 5),
                  display: `inline-block`,
                  margin: 0,
                  verticalAlign: `middle`,
                }}
              >
                Gatsby
              </h1>
            </Link>
            <ul
              css={{
                display: `none`,
                [presets.Tablet]: {
                  display: `block`,
                  margin: 0,
                  padding: 0,
                  listStyle: `none`,
                },
              }}
            >
              <NavItem linkTo="/docs/">Docs</NavItem>
              <NavItem linkTo="/tutorial/">Tutorial</NavItem>
              <NavItem linkTo="/community/">Community</NavItem>
              <NavItem linkTo="/blog/">Blog</NavItem>
            </ul>
            <div
              css={{
                marginLeft: isHomepage ? rhythm(1 / 2) : `auto`,
                [presets.Phablet]: {
                  marginLeft: isHomepage ? `auto` : `auto`,
                },
              }}
            >
              <a
                href="https://github.com/gatsbyjs/gatsby"
                title="Github"
                css={{
                  ...navItemStyles,
                  ...socialIconsStyles,
                }}
              >
                <GithubIcon style={{ verticalAlign: `text-top` }} />
              </a>
              <a
                href="https://discord.gg/0ZcbPKXt5bZjGY5n"
                title="Discord"
                css={{
                  ...navItemStyles,
                  ...socialIconsStyles,
                }}
              >
                <DiscordIcon overrideCSS={{ verticalAlign: `text-top` }} />
              </a>
              <a
                href="https://twitter.com/gatsbyjs"
                title="@gatsbyjs"
                css={{
                  ...navItemStyles,
                  ...socialIconsStyles,
                  paddingRight: 0,
                }}
              >
                <TwitterIcon style={{ verticalAlign: `text-top` }} />
              </a>
            </div>
          </div>
        </div>
        <div
          className={`main-body`}
          css={{
            paddingTop: 0,
            [presets.Tablet]: {
              margin: `0 auto`,
              paddingTop: isHomepage ? 0 : headerHeight,
            },
          }}
        >
          {/* TODO Move this under docs/index.js once Gatsby supports multiple levels
               of layouts */}
          <div
            css={{
              ...sidebarStyles,
              [presets.Tablet]: {
                display:
                  this.props.location.pathname.slice(0, 6) === `/docs/` ||
                  this.props.location.pathname.slice(0, 10) === `/packages/`
                    ? `block`
                    : `none`,
              },
            }}
          >
            <SidebarBody yaml={docsSidebar} />
          </div>
          {/* TODO Move this under docs/tutorial/index.js once Gatsby supports multiple levels
               of layouts */}
          <div
            css={{
              ...sidebarStyles,
              [presets.Tablet]: {
                display:
                  this.props.location.pathname.slice(0, 10) === `/tutorial/`
                    ? `block`
                    : `none`,
              },
            }}
          >
            <SidebarBody yaml={tutorialSidebar} />
          </div>
          <div
            css={{
              paddingLeft: 0,
              [presets.Tablet]: {
                paddingLeft:
                  this.props.location.pathname.slice(0, 6) === `/docs/` ||
                  this.props.location.pathname.slice(0, 10) === `/packages/` ||
                  this.props.location.pathname.slice(0, 10) === `/tutorial/`
                    ? rhythm(10)
                    : 0,
              },
            }}
          >
            {this.props.children()}
          </div>
        </div>
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
      </div>
    )
  },
})
