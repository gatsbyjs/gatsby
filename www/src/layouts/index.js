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
import tutorialSidebar from "../pages/docs/tutorial-links.yml"
import docsSidebar from "../pages/docs/doc-links.yaml"
import presets from "../utils/presets"
import colors from "../utils/colors"

import "../css/prism-coy.css"

// Import Futura PT typeface
import "../fonts/Webfonts/futurapt_book_macroman/stylesheet.css"
import "../fonts/Webfonts/futurapt_bookitalic_macroman/stylesheet.css"
import "../fonts/Webfonts/futurapt_demi_macroman/stylesheet.css"
import "../fonts/Webfonts/futurapt_demiitalic_macroman/stylesheet.css"

// Other fonts
import "typeface-tex-gyre-schola"
import "typeface-space-mono"

const vP = rhythm(presets.vPR)
const vPHd = rhythm(presets.vPHdR)
const vPVHd = rhythm(presets.vPVHdR)
const vPVVHd = rhythm(presets.vPVVHdR)

module.exports = React.createClass({
  propTypes() {
    return {
      children: React.PropTypes.any,
    }
  },
  render() {
    const headerHeight =
      this.props.location.pathname !== `/` ? `3.5rem` : `3.5rem`
    const verticalPadding =
      this.props.location.pathname !== `/`
        ? {}
        : {
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
    const sidebarStyles = {
      borderRight: `1px solid ${colors.b[0]}`,
      backgroundColor: `#fcfaff`,
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
      display: `inline-block`,
      color: `inherit`,
      textDecoration: `none`,
      textTransform: `uppercase`,
      letterSpacing: `0.03em`,
      padding: `0 ${rhythm(0.5)}`,
      position: `relative`,
      top: 2,
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
          color: `#744c9e`,
          marginBottom: 2,
          textDecoration: `none`,
          textAlign: `center`,
          textTransform: `uppercase`,
          letterSpacing: `0.07em`,
        }}
      >
        {children}
        <div css={{ opacity: 0.8 }}>
          {title}
        </div>
      </Link>

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
            borderBottomColor:
              this.props.location.pathname !== `/`
                ? `${presets.veryLightPurple}`
                : `transparent`,
            backgroundColor:
              this.props.location.pathname !== `/`
                ? `rgba(255,255,255,0.975)`
                : `rgba(0,0,0,0)`,
            position: this.props.location.pathname !== `/` ? false : `absolute`,
            height: headerHeight,
            [presets.Tablet]: {
              position:
                this.props.location.pathname !== `/` ? `fixed` : `absolute`,
              zIndex: `1`,
              left: 0,
              right: 0,
            },
          }}
        >
          <div
            css={{
              // maxWidth: rhythm(presets.maxWidth),
              margin: `0 auto`,
              paddingLeft: rhythm(3 / 4),
              paddingRight: rhythm(3 / 4),
              ...verticalPadding,
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
                  height: rhythm(1.3),
                  width: rhythm(1.3),
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
                [presets.Tablet]: {
                  marginLeft: `auto`,
                },
              }}
            >
              <a
                href="https://github.com/gatsbyjs/gatsby"
                css={{
                  ...navItemStyles,
                  [presets.Tablet]: {
                    color:
                      this.props.location.pathname !== `/` ? false : `white`,
                  },
                }}
              >
                <GithubIcon css={{ verticalAlign: `text-top` }} />
                {` `}
              </a>
              <a
                href="https://github.com/gatsbyjs/gatsby"
                css={{
                  ...navItemStyles,
                  [presets.Tablet]: {
                    color:
                      this.props.location.pathname !== `/` ? false : `white`,
                  },
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  viewBox="0 0 28 28"
                  xmlSpace="preserve"
                  fill="currentColor"
                  height="1em"
                  width="1em"
                  preserveAspectRatio="xMidYMid meet"
                  style={{ verticalAlign: `middle` }}
                >
                  <g>
                    <path d="M11.5,11.7c-0.8,0-1.4,0.7-1.4,1.6s0.6,1.6,1.4,1.6c0.8,0,1.4-0.7,1.4-1.6
                              C12.9,12.4,12.3,11.7,11.5,11.7L11.5,11.7z M16.6,11.7c-0.8,0-1.4,0.7-1.4,1.6s0.6,1.6,1.4,1.6c0.8,0,1.4-0.7,1.4-1.6
                              S17.4,11.7,16.6,11.7L16.6,11.7z" />
                    <path d="M23.4,0H4.6C3,0,1.8,1.3,1.8,2.9v18.9c0,1.6,1.3,2.9,2.9,2.9h15.9l-0.7-2.6l1.8,1.7l1.7,1.6
                              l3,2.7V2.9C26.2,1.3,25,0,23.4,0L23.4,0z M18,18.3c0,0-0.5-0.6-0.9-1.1c1.8-0.5,2.5-1.7,2.5-1.7c-0.6,0.4-1.1,0.6-1.6,0.8
                              c-0.7,0.3-1.4,0.5-2,0.6c-1.3,0.3-2.6,0.2-3.6,0c-0.8-0.2-1.5-0.4-2.1-0.6c-0.3-0.1-0.7-0.3-1-0.5c0,0-0.1,0-0.1-0.1c0,0,0,0-0.1,0
                              c-0.3-0.1-0.4-0.2-0.4-0.2s0.7,1.1,2.4,1.7c-0.4,0.5-0.9,1.2-0.9,1.2c-3.1-0.1-4.3-2.1-4.3-2.1c0-4.5,2-8.2,2-8.2
                              c2-1.5,3.9-1.5,3.9-1.5L12,6.7C9.5,7.4,8.3,8.5,8.3,8.5s0.3-0.2,0.8-0.4c1.5-0.7,2.7-0.8,3.2-0.9c0.1,0,0.2,0,0.2,0
                              c0.9-0.1,1.8-0.1,2.8,0c1.3,0.2,2.8,0.5,4.2,1.3c0,0-1.1-1.1-3.5-1.8l0.2-0.2c0,0,1.9,0,3.9,1.5c0,0,2,3.7,2,8.2
                              C22.3,16.2,21.1,18.2,18,18.3L18,18.3z" />
                  </g>
                </svg>
              </a>
              <a
                href="https://twitter.com/gatsbyjs"
                css={{
                  ...navItemStyles,
                  [presets.Tablet]: {
                    color:
                      this.props.location.pathname !== `/` ? false : `white`,
                  },
                }}
              >
                <TwitterIcon css={{ verticalAlign: `text-top` }} />
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
              paddingTop:
                this.props.location.pathname !== `/` ? headerHeight : 0,
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
            ...scale(-2 / 5),
            position: `fixed`,
            display: `flex`,
            justifyContent: `space-around`,
            alignItems: `flex-end`,
            bottom: 0,
            left: 0,
            right: 0,
            height: rhythm(2.5),
            background: presets.veryLightPurple,
            borderTop: `1px solid ${colors.b[0]}`,
            background: `#fcfaff`,
            fontFamily: typography.options.headerFontFamily.join(`,`),
            [presets.Tablet]: {
              display: `none`,
            },
          }}
        >
          <MobileNavItem linkTo="/docs/">
            <DocumentIcon
              css={{
                fontSize: rhythm(0.9),
              }}
            />
            <div>Docs</div>
          </MobileNavItem>
          <MobileNavItem linkTo="/tutorial/" title="Tutorial">
            <CodeIcon
              css={{
                fontSize: rhythm(1),
              }}
            />
          </MobileNavItem>
          <MobileNavItem linkTo="/community/" title="Community">
            <PersonIcon
              css={{
                fontSize: rhythm(5 / 6),
                position: `relative`,
                right: -4,
              }}
            />
            <PersonIcon
              css={{
                fontSize: rhythm(5 / 6),
              }}
            />
            <PersonIcon
              css={{
                fontSize: rhythm(5 / 6),
                position: `relative`,
                left: -4,
              }}
            />
          </MobileNavItem>
          <MobileNavItem linkTo="/blog/" title="Blog">
            <PencilIcon
              css={{
                fontSize: rhythm(0.9),
              }}
            />
          </MobileNavItem>
        </div>
      </div>
    )
  },
})
