import React from "react"
import Link from "gatsby-link"

import typography, { rhythm, scale, options } from "../utils/typography"
import presets from "../utils/presets"

class SidebarBody extends React.Component {
  render() {
    const menu = this.props.yaml

    // Use original sizes on mobile as the text is inline
    // but smaller on > tablet so as not to compete with body text.
    const fontSize = this.props.inline
      ? scale(0).fontSize
      : scale(-2 / 10).fontSize
    const headerStyles = this.props.inline
      ? {
          fontSize: scale(2 / 5).fontSize,
          fontStyle: false,
          color: false,
        }
      : {
          fontSize: scale(-1 / 3).fontSize,
          fontStyle: `normal`,
          color: presets.brandLight,
        }
    const headerTextTransform = this.props.inline ? false : `uppercase`
    return (
      <div
        css={{
          marginBottom: rhythm(1),
          padding: this.props.inline ? 0 : rhythm(3 / 4),
        }}
      >
        {menu.map((section, index) => (
          <div
            key={section.title}
            css={{
              fontSize,
            }}
          >
            <h3
              css={{
                ...headerStyles,
                textTransform: headerTextTransform,
                marginTop: index === 0 ? 0 : false,
              }}
            >
              {section.title}
            </h3>
            <ul
              css={{
                listStyle: `none`,
                margin: 0,
                fontFamily: typography.options.headerFontFamily.join(`,`),
              }}
            >
              {Object.keys(section.links).map(title => {
                // Don't show the main docs link on mobile as we put these
                // links on that main docs page so it's confusing to have
                // the page link to itself.
                if (this.props.inline && section.links[title] === `/docs/`) {
                  return null
                }

                // If the last character is a * then the doc page is still in draft
                let changedTitle = title
                let linkStyle = {
                  "&&": {
                    borderBottom: `none`,
                    boxShadow: `none`,
                    fontWeight: `normal`,
                    ":hover": {
                      color: `inherit`,
                      borderBottom: `none`,
                      boxShadow: `none`,
                    },
                  },
                }
                if (title.slice(-1) === `*`) {
                  changedTitle = title.slice(0, -1)
                  linkStyle = {
                    // Increase specifity to override `.main-body a` styles
                    // defined in src/utils/typography.js.
                    "&&": {
                      color: presets.calm,
                      borderBottomColor: presets.veryLightPurple,
                      borderBottom: `none`,
                      boxShadow: `inset 0 -5px 0px 0px ${presets.veryLightPurple}`,
                      boxShadow: `none`,
                      fontStyle: `italic`,
                      fontWeight: `normal`,
                      ":hover": {
                        color: `inherit`,
                        borderBottomColor: presets.lightPurple,
                        boxShadow: `inset 0 -5px 0px 0px ${presets.lightPurple}`,
                        borderBottom: `none`,
                        boxShadow: `none`,
                      },
                    },
                  }
                }
                return (
                  <li
                    key={section.links[title]}
                    css={{ marginBottom: options.blockMarginBottom / 2 }}
                  >
                    {
                      section.links[title][0] == `#` ?
                        <a href={section.links[title]} css={linkStyle}>
                          {changedTitle}
                        </a> :
                        <Link to={section.links[title]} css={linkStyle}>
                          {changedTitle}
                        </Link>
                    }
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    )
  }
}

export default SidebarBody
