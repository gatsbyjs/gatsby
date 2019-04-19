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
    (flat, item) => flat.concat(item.items ? flatten(item.items) : item),
    []
  )

class StubListRoute extends React.Component {
  render() {
    const stubs = findStubs(
      flatten([...itemListContributing.items, ...itemListDocs.items])
    )

    return (
      <Layout location={this.props.location} itemList={itemListContributing}>
        <DocsearchContent>
          <Container>
            <Helmet>
              <title>Stub List</title>
            </Helmet>
            <h1 id="stublist" css={{ marginTop: 0 }}>
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
            <ul data-testid="list-of-stubs">
              {stubs.map(stub => (
                <li key={stub.title}>
                  <Link to={stub.link}>{stub.title.slice(0, -1)}</Link>
                </li>
              ))}
            </ul>
            <FooterLinks />
          </Container>
        </DocsearchContent>
      </Layout>
    )
  }
}

export default StubListRoute
