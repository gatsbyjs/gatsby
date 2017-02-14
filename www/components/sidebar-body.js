import React from "react"
import Link from "gatsby-link"

import typography, { rhythm, scale } from "../utils/typography"
import menu from "../pages/docs/doc-links.yaml"
console.log(menu)

class SidebarBody extends React.Component {
  render () {
    return (
      <div>
        {menu.map((section) => {
          return (
            <div
              key={section.title}
            >
              <h3
                css={{
                  ...scale(1/5),
                  lineHeight: 1.1,
                }}
              >
                {section.title}
              </h3>
              <ul
                css={{
                  fontFamily: typography.options.headerFontFamily.join(`,`),
                }}
              >
                {Object.keys(section.links).map((title) => {
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
          )
        })}
      </div>
    )
  }
}

export default SidebarBody
