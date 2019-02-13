import React from "react"
import { Link } from "gatsby"
import { Helmet } from "react-helmet"

import Layout from "../../components/layout"
import { itemListContributing } from "../../utils/sidebar/item-list"
import Container from "../../components/container"
import EmailCaptureForm from "../../components/email-capture-form"
import DocSearchContent from "../../components/docsearch-content"

class IndexRoute extends React.Component {
  render() {
    return (
      <Layout location={this.props.location} itemList={itemListContributing}>
        <DocSearchContent>
          <Container>
            <Helmet>
              <title>Contributing</title>
            </Helmet>
            <h1 id="contributing-gatsby" css={{ marginTop: 0 }}>
              Contributing to Gatsby.js
            </h1>
            <p>
              Find guides on the Gatsby community, code of conduct, and how to
              get started contributing to Gatsby.
            </p>
            <EmailCaptureForm signupMessage="Want to keep up with the latest tips &amp; tricks? Subscribe to our newsletter!" />
          </Container>
        </DocSearchContent>
      </Layout>
    )
  }
}

export default IndexRoute
