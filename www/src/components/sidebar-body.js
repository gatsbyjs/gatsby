import React from "react"
import Link from "gatsby-link"

import typography, { rhythm, scale } from "../utils/typography"
import menu from "../pages/docs/doc-links.yaml"

class SidebarBody extends React.Component {
  render() {
    // Use original sizes on mobile as the text is inline
    // but smaller on > tablet so as not to compete with body text.
    const fontSize = this.props.inline
      ? scale(0).fontSize
      : scale(-1 / 10).fontSize
    const headerSize = this.props.inline
      ? scale(2 / 5).fontSize
      : scale(1 / 5).fontSize
    return (
      <div
        css={{
          marginBottom: rhythm(1),
          padding: this.props.inline ? 0 : rhythm(3 / 4),
        }}
      >
        {menu.map((section, index) =>
          <div
            key={section.title}
            css={{
              fontSize,
            }}
          >
            <h3
              css={{
                fontSize: headerSize,
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
                let draft = false
                let changedTitle = title
                if (title.slice(-1) === `*`) {
                  draft = true
                  changedTitle = title.slice(0, -1)
                }
                return (
                  <li
                    css={{
                      fontStyle: draft ? `italic` : `inherit`,
                      color: draft ? `#ccc` : `inherit`,
                    }}
                    key={section.links[title]}
                  >
                    <Link to={section.links[title]}>
                      {changedTitle}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    )
  }
}

export default SidebarBody
