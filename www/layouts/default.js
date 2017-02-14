import React from "react"
import typography, { rhythm, scale } from "utils/typography"
import logo from "images/gatsby-monogram.jpg"
import Link from "react-router/lib/Link"
import DocumentIcon from "react-icons/lib/go/file-text"
import CodeIcon from "react-icons/lib/go/code"
import PencilIcon from "react-icons/lib/go/pencil"
import PersonIcon from "react-icons/lib/md/person"
import { presets } from "glamor"

import SidebarBody from "../components/sidebar-body"

import "css/prism-coy.css"

// Import Futura PT typeface
import "fonts/Webfonts/futurapt_book_macroman/stylesheet.css"
import "fonts/Webfonts/futurapt_bookitalic_macroman/stylesheet.css"
import "fonts/Webfonts/futurapt_demi_macroman/stylesheet.css"
import "fonts/Webfonts/futurapt_demiitalic_macroman/stylesheet.css"

// Other fonts
import "typeface-tex-gyre-schola"
import "typeface-space-mono"

module.exports = React.createClass({
  propTypes () {
    return {
      children: React.PropTypes.any,
    }
  },
  render () {
    return (
      <div>
        <div
          css={{
            background: `#f4dfc6`,
          }}
        >
          <div
            css={{
              maxWidth: rhythm(37),
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
                  ...scale((-1) / 5),
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
                    ...scale((-1) / 5),
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
                ...scale((-1) / 5),
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
            maxWidth: rhythm(37),
            margin: `${rhythm((-1) / 2)} auto ${rhythm(1.75)} auto`,
            padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
            paddingTop: 0,
            [presets.Tablet]: {
              margin: `0 auto`,
            },
          }}
        >
          {/* TODO Move this under docs/index.js once Gatsby supports multiple levels
               of layouts */
          }
          <div
            css={{
              float: `left`,
              marginTop: rhythm((-3) / 4),
              width: rhythm(9),
              display: `none`,
              [presets.Tablet]: {
                display: (
                  this.props.location.pathname.slice(0, 6) === `/docs/`
                    ? `block`
                    : `none`
                ),
              },
            }}
          >
            <SidebarBody />
          </div>
          <div
            css={{
              paddingLeft: 0,
              [presets.Tablet]: {
                paddingLeft: (
                  this.props.location.pathname.slice(0, 6) === `/docs/`
                    ? rhythm(11)
                    : 0
                ),
              },
            }}
          >
            {this.props.children}
          </div>
        </div>
        <div
          css={{
            ...scale((-1) / 5),
            position: `fixed`,
            display: `flex`,
            justifyContent: `space-around`,
            alignItems: `flex-end`,
            bottom: 0,
            left: 0,
            right: 0,
            height: rhythm(2.5),
            background: `#f4dfc6`,
            fontFamily: typography.options.headerFontFamily.join(`,`),
            [presets.Tablet]: {
              display: `none`,
            },
          }}
        >
          <Link
            to="/docs/"
            css={{
              color: typography.options.bodyColor,
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
              color: typography.options.bodyColor,
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
              color: typography.options.bodyColor,
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
              color: typography.options.bodyColor,
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
