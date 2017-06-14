import React from "react"
import Link from "gatsby-link"
import DocumentIcon from "react-icons/lib/go/file-text"
import CodeIcon from "react-icons/lib/go/code"
import PencilIcon from "react-icons/lib/go/pencil"
import PersonIcon from "react-icons/lib/md/person"
import Helmet from "react-helmet"

import logo from "../gatsby-negative.svg"
import typography, { rhythm, scale } from "../utils/typography"
import SidebarBody from "../components/sidebar-body"
import TutorialSidebarBody from "../components/tutorial-sidebar"
import presets from "../utils/presets"

import "../css/prism-coy.css"

// Import Futura PT typeface
import "../fonts/Webfonts/futurapt_book_macroman/stylesheet.css"
import "../fonts/Webfonts/futurapt_bookitalic_macroman/stylesheet.css"
import "../fonts/Webfonts/futurapt_demi_macroman/stylesheet.css"
import "../fonts/Webfonts/futurapt_demiitalic_macroman/stylesheet.css"

// Other fonts
import "typeface-tex-gyre-schola"
import "typeface-space-mono"

module.exports = React.createClass({
  propTypes() {
    return {
      children: React.PropTypes.any,
    }
  },
  render() {
    return (
      <div>
        <Helmet
          title={`GatsbyJS`}
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
            borderBottom: this.props.location.pathname !== `/`
              ? `1px solid #744c9e`
              : ``,
          }}
        >
          <div
            css={{
              maxWidth: rhythm(presets.maxWidth),
              margin: `0 auto`,
              padding: `${rhythm(1 / 3)} ${rhythm(3 / 4)}`,
              fontFamily: typography.options.headerFontFamily.join(`,`),
            }}
          >
            <Link
              to="/"
              css={{
                color: `inherit`,
                display: `inline-block`,
                textDecoration: `none`,
              }}
            >
              <img
                src={logo}
                css={{
                  display: `inline-block`,
                  height: rhythm(1.4),
                  width: rhythm(1.4),
                  marginBottom: 0,
                  marginRight: rhythm(1 / 4),
                  verticalAlign: `middle`,
                }}
              />
              <h1
                css={{
                  ...scale(3 / 5),
                  display: `inline-block`,
                  lineHeight: rhythm(1.5),
                  verticalAlign: `middle`,
                  margin: 0,
                }}
              >
                Gatsby
              </h1>
            </Link>
            <ul
              css={{
                display: `none`,
                [presets.Tablet]: {
                  ...scale(-1 / 5),
                  display: `inline-block`,
                  lineHeight: rhythm(1.5),
                  margin: 0,
                  padding: 0,
                  listStyle: `none`,
                  marginLeft: rhythm(1),
                  verticalAlign: `bottom`,
                  position: `relative`,
                  top: 1,
                },
              }}
            >
              <li
                css={{
                  display: `inline-block`,
                  margin: 0,
                  marginRight: rhythm(1),
                }}
              >
                <Link
                  to="/docs/"
                  css={{
                    ...scale(-1 / 5),
                    color: `inherit`,
                    textDecoration: `none`,
                    textTransform: `uppercase`,
                    letterSpacing: `0.03em`,
                  }}
                >
                  Docs
                </Link>
              </li>
              <li
                css={{
                  display: `inline-block`,
                  margin: 0,
                  marginRight: rhythm(1),
                }}
              >
                <Link
                  to="/tutorial/"
                  css={{
                    color: `inherit`,
                    textDecoration: `none`,
                    textTransform: `uppercase`,
                    letterSpacing: `0.03em`,
                  }}
                >
                  Tutorial
                </Link>
              </li>
              <li
                css={{
                  display: `inline-block`,
                  margin: 0,
                  marginRight: rhythm(1),
                }}
              >
                <Link
                  to="/community/"
                  css={{
                    color: `inherit`,
                    textDecoration: `none`,
                    textTransform: `uppercase`,
                    letterSpacing: `0.03em`,
                  }}
                >
                  Community
                </Link>
              </li>
              <li
                css={{
                  display: `inline-block`,
                  margin: 0,
                  marginRight: rhythm(1),
                }}
              >
                <Link
                  to="/blog/"
                  css={{
                    color: `inherit`,
                    textDecoration: `none`,
                    textTransform: `uppercase`,
                    letterSpacing: `0.03em`,
                  }}
                >
                  Blog
                </Link>
              </li>
            </ul>
            <a
              href="https://github.com/gatsbyjs/gatsby"
              css={{
                ...scale(-1 / 5),
                color: typography.options.bodyColor,
                display: `inline-block`,
                float: `right`,
                lineHeight: rhythm(1.5),
                marginRight: rhythm(1 / 2),
                textDecoration: `none`,
                verticalAlign: `bottom`,
                textTransform: `uppercase`,
                letterSpacing: `0.03em`,
                position: `relative`,
                top: 1,
              }}
            >
              Github
            </a>
          </div>
        </div>
        <div
          className={`main-body`}
          css={{
            paddingTop: 0,
            [presets.Tablet]: {
              margin: `0 auto`,
            },
          }}
        >
          {/* TODO Move this under docs/index.js once Gatsby supports multiple levels
               of layouts */}
          <div
            css={{
              float: `left`,
              width: rhythm(10),
              display: `none`,
              [presets.Tablet]: {
                borderRight: `1px solid ${presets.purple}`,
                position: `fixed`,
                overflowY: `scroll`,
                height: `calc(100vh - 55px)`,
                display: this.props.location.pathname.slice(0, 6) === `/docs/`
                  ? `block`
                  : `none`,
              },
            }}
          >
            <SidebarBody />
          </div>
          {/* TODO Move this under docs/tutorial/index.js once Gatsby supports multiple levels
               of layouts */}
          <div
            css={{
              float: `left`,
              width: rhythm(10),
              display: `none`,
              [presets.Tablet]: {
                borderRight: `1px solid ${presets.purple}`,
                position: `fixed`,
                display: this.props.location.pathname.slice(0, 10) ===
                  `/tutorial/`
                  ? `block`
                  : `none`,
              },
            }}
          >
            <TutorialSidebarBody />
          </div>
          <div
            css={{
              paddingLeft: 0,
              [presets.Tablet]: {
                paddingLeft: this.props.location.pathname.slice(0, 6) ===
                  `/docs/` ||
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
            ...scale(-1 / 5),
            position: `fixed`,
            display: `flex`,
            justifyContent: `space-around`,
            alignItems: `flex-end`,
            bottom: 0,
            left: 0,
            right: 0,
            height: rhythm(2.5),
            // borderTop: `1px solid ${presets.purple}`,
            background: presets.veryLightPurple,
            fontFamily: typography.options.headerFontFamily.join(`,`),
            [presets.Tablet]: {
              display: `none`,
            },
          }}
        >
          <Link
            to="/docs/"
            css={{
              color: presets.purple,
              marginBottom: 2,
              textDecoration: `none`,
              textAlign: `center`,
              textTransform: `uppercase`,
              letterSpacing: `0.07em`,
            }}
          >
            <DocumentIcon
              css={{
                fontSize: rhythm(1),
              }}
            />
            <div>
              Docs
            </div>
          </Link>
          <Link
            to="/tutorial/"
            css={{
              color: presets.purple,
              marginBottom: 2,
              textDecoration: `none`,
              textAlign: `center`,
              textTransform: `uppercase`,
              letterSpacing: `0.07em`,
            }}
          >
            <CodeIcon
              css={{
                fontSize: rhythm(1),
              }}
            />
            <div>
              Tutorial
            </div>
          </Link>
          <Link
            to="/community/"
            css={{
              color: presets.purple,
              marginBottom: 2,
              textDecoration: `none`,
              textAlign: `center`,
              textTransform: `uppercase`,
              letterSpacing: `0.07em`,
            }}
          >
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
            <div>
              Community
            </div>
          </Link>
          <Link
            to="/blog/"
            css={{
              color: presets.purple,
              marginBottom: 2,
              textDecoration: `none`,
              textAlign: `center`,
              textTransform: `uppercase`,
              letterSpacing: `0.07em`,
            }}
          >
            <PencilIcon
              css={{
                fontSize: rhythm(1),
              }}
            />
            <div>
              Blog
            </div>
          </Link>
        </div>
      </div>
    )
  },
})
