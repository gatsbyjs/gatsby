/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { Link } from "gatsby"
import { Helmet } from "react-helmet"

import Layout from "../../components/layout"
import { itemListContributing } from "../../utils/sidebar/item-list"
import Container from "../../components/container"
import EmailCaptureForm from "../../components/email-capture-form"
import DocSearchContent from "../../components/docsearch-content"
import FooterLinks from "../../components/shared/footer-links"
import PrevAndNext from "../../components/prev-and-next"

class IndexRoute extends React.Component {
  render() {
    return (
      <Layout location={this.props.location} itemList={itemListContributing}>
        <DocSearchContent>
          <Container>
            <Helmet>
              <title>Contributing</title>
              <meta
                name="description"
                content="Learn about contributing to one of the most welcoming communities helping develop the future of the web"
              />
            </Helmet>
            <h1 id="contributing-gatsby" css={{ marginTop: 0 }}>
              Contributing to Gatsby.js
            </h1>
            <p>
              Thanks for being interested in contributing! We're so glad you
              want to help!
            </p>
            <p>
              Below you'll find guides on the Gatsby.js community, code of
              conduct, and how to get started contributing:
            </p>
            <ul>
              <li>
                <Link to="/contributing/community/">Community</Link>: Learn why
                you should contribute to Gatsby.js, the most effective ways to
                do so, and all about the benefits (did we mention the free
                swag?)
              </li>
              <li>
                <Link to="/contributing/code-of-conduct/">Code of Conduct</Link>
                : Read about what we expect from everyone participating in
                Gatsby.js to make it the most friendly and welcoming community
              </li>
              <li>
                <Link to="/contributing/gatsby-style-guide/">
                  Gatsby Style Guide
                </Link>
                : The art of contributing to Gatsby, a.k.a. the detailed
                requirements that will make it more likely your contribution is
                accepted with minimal changes
              </li>
              <li>
                <Link to="/contributing/how-to-contribute/">
                  How to Contribute
                </Link>
                : How to get the most out of your Gatsby.js contributing
                experience, including GitHub management tips, setup instructions
                for docs and code contributions, and more
              </li>
              <li>
                <Link to="/contributing/rfc-process">RFC process</Link>: Learn
                how the Gatsby.js team manages bigger changes, by way of a
                “Request-for-comment” process on GitHub
              </li>
            </ul>
            <EmailCaptureForm signupMessage="Want to keep up with the latest tips &amp; tricks? Subscribe to our newsletter!" />
            <PrevAndNext
              sx={{ mt: 9 }}
              next={{ title: `Community`, link: `/contributing/community/` }}
            />
          </Container>
          <FooterLinks />
        </DocSearchContent>
      </Layout>
    )
  }
}

export default IndexRoute
