import React from "react"
import Link from "gatsby-link"

import typography, { rhythm, scale } from "../utils/typography"
import menu from "../pages/docs/doc-links.yaml"
console.log(menu)

class SidebarBody extends React.Component {
  render () {
    // Use original sizes on mobile as the text is inline
    // but smaller on > tablet so as not to compete with body text.
    const fontSize = this.props.inline
      ? scale(0).fontSize
      : scale((-1) / 10).fontSize
    const headerSize = this.props.inline
      ? scale(2 / 5).fontSize
      : scale(1 / 5).fontSize
    return (
      <div>
        {menu.map(section => (
          <div
            key={section.title}
            css={{
              fontSize,
            }}
          >
            <h3
              css={{
                fontSize: headerSize,
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
                return (
                  <li key={section.links[title]}>
                    <Link to={section.links[title]}>
                      {title}
                    </Link>
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
