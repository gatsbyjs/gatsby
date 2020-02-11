/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { Link } from "gatsby"

import { itemListContributing, itemListDocs } from "../utils/sidebar/item-list"

const findStubs = pages =>
  pages.filter(
    page => page.link !== undefined && page.title.indexOf(`*`) !== -1
  )

const flatten = pages =>
  pages.reduce(
    (flat, item) =>
      flat.concat(item.items ? flatten(item.items).concat(item) : item),
    []
  )

class StubList extends React.Component {
  render() {
    const stubs = findStubs(
      flatten([...itemListContributing.items, ...itemListDocs.items])
    )

    let groupedStubs = {}

    stubs.forEach(stub => {
      let categoryTitle = stub.parentTitle || `Top Level Documentation Pages`

      if (groupedStubs[categoryTitle] === undefined) {
        groupedStubs[categoryTitle] = []
      }
      groupedStubs[categoryTitle].push(stub)
    })

    let sortedCategories = Object.keys(groupedStubs).sort((a, b) =>
      a.localeCompare(b)
    )

    // Put top level at the front of the array if it isn't empty
    sortedCategories.splice(
      sortedCategories.indexOf(`Top Level Documentation Pages`),
      1
    )

    if (groupedStubs[`Top Level Documentation Pages`]) {
      sortedCategories = [`Top Level Documentation Pages`, ...sortedCategories]
    }

    return (
      <section data-testid="list-of-stubs">
        {sortedCategories.map(category => {
          let categoryTitle =
            category.slice(-1) === `*` ? category.slice(0, -1) : category
          return (
            <React.Fragment key={category}>
              <h2 sx={{ fontSize: 4, mb: 3 }}>{categoryTitle}</h2>
              <ul>
                {groupedStubs[category].map(stub => (
                  <li key={stub.title}>
                    <Link to={stub.link}>{stub.title.slice(0, -1)}</Link>
                  </li>
                ))}
              </ul>
            </React.Fragment>
          )
        })}
      </section>
    )
  }
}

export default StubList
