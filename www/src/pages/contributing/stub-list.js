/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { Link } from "gatsby"
import { Helmet } from "react-helmet"

import Layout from "../../components/layout"
import {
  itemListContributing,
  itemListDocs,
} from "../../utils/sidebar/item-list"
import Container from "../../components/container"
import DocsearchContent from "../../components/docsearch-content"
import FooterLinks from "../../components/shared/footer-links"

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

class StubListRoute extends React.Component {
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
      <Layout location={this.props.location} itemList={itemListContributing}>
        <DocsearchContent>
          <Container>
            <Helmet>
              <title>Stub List</title>
              <meta
                name="description"
                content="Find places in the documentation that are still a work in progress, in need of community help"
              />
            </Helmet>
            <h1 id="stublist" sx={{ mt: 0 }}>
              Stub List
            </h1>
            <p>
              There are a variety of pages that are currently stubbed out but do
              not contain any content yet. If you are interested in helping
              write any of these pages, head to any of them or head over to{` `}
              <Link to="/contributing/how-to-write-a-stub/">
                How to Write a Stub
              </Link>
              {` `}
              to learn more.
            </p>
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
          </Container>
          <FooterLinks />
        </DocsearchContent>
      </Layout>
    )
  }
}

export default StubListRoute
