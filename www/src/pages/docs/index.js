import React from "react"
import { Link } from "gatsby"
import { Helmet } from "react-helmet"

import Layout from "../../components/layout"
import { itemListDocs } from "../../utils/sidebar/item-list"
import Container from "../../components/container"
import EmailCaptureForm from "../../components/email-capture-form"
import DocSearchContent from "../../components/docsearch-content"
import FooterLinks from "../../components/shared/footer-links"

class IndexRoute extends React.Component {
  render() {
    return (
      <Layout location={this.props.location} itemList={itemListDocs}>
        <DocSearchContent>
          <Container>
            <Helmet>
              <title>Docs</title>
            </Helmet>
            <h1 id="gatsby-documentation" css={{ marginTop: 0 }}>
              Gatsby.js Documentation
            </h1>
            <p>Gatsby is a blazing fast modern site generator for React.</p>
            <h2>Get Started</h2>
            <p>There are four main ways to get started with Gatsby:</p>
            <ol>
              <li>
                <Link to="/tutorial/">Tutorial</Link>: Step-by-step instructions
                on how to install Gatsby and start a project: written for people
                without Gatsby or web development experience, though it has
                helped developers of all skill levels.
              </li>
              <li>
                <Link to="/docs/quick-start">Quick start</Link>: One page
                summary of how to install Gatsby and start a new project.
              </li>
              <li>
                <Link to="/docs/recipes/">Recipes</Link>: A happy medium between
                the tutorial and the quick start. Find some quick answers for
                how to accomplish some specific, common tasks with Gatsby.
              </li>
              <li>
                Choose your own adventure and peruse the various sections of the
                Gatsby docs:
                <ul>
                  <li>
                    <Link to="/docs/guides/">Guides</Link>: Dive deeper into
                    different topics around building with Gatsby, like sourcing
                    data, deployment, and more.
                  </li>
                  <li>
                    <Link to="/ecosystem/">Ecosystem</Link>: Check out libraries
                    for Gatsby starters and plugins, as well as external
                    community resources.
                  </li>
                  <li>
                    <Link to="/docs/api-reference/">API Reference</Link>: Learn
                    more about Gatsby APIs and configuration.
                  </li>
                  <li>
                    <Link to="/docs/releases-and-migration/">
                      Releases &amp; Migration
                    </Link>
                    : Find release notes and guides for migration between major
                    versions.
                  </li>
                  <li>
                    <Link to="/docs/conceptual-guide/">Conceptual Guide</Link>:
                    Read high-level overviews of the Gatsby approach.
                  </li>
                  <li>
                    <Link to="/docs/behind-the-scenes/">Behind the Scenes</Link>
                    : Dig into how Gatsby works under the hood.
                  </li>
                  <li>
                    <Link to="/docs/advanced-tutorials/">
                      Advanced Tutorials
                    </Link>
                    : Learn about topics that are too large for a doc and
                    warrant a tutorial.
                  </li>
                  <li>
                    <Link to="/docs/using-gatsby-professionally/">
                      Using Gatsby Professionally
                    </Link>
                    : Learn tips and tricks for how to explain Gatsby to others
                    at work, so that you have more opportunities to work with
                    Gatsby professionally.
                  </li>
                  <li>
                    <Link to="/contributing/">Contributing</Link>: Find guides
                    on the Gatsby.js community, code of conduct, and how to get
                    started contributing.
                  </li>
                </ul>
              </li>
            </ol>
            <p>
              Visit the <Link to="/contributing">Contributing</Link> section to
              find guides on the Gatsby community, code of conduct, and how to
              get started contributing to Gatsby.
            </p>
            <EmailCaptureForm signupMessage="Want to keep up with the latest tips &amp; tricks? Subscribe to our newsletter!" />

            <FooterLinks />
          </Container>
        </DocSearchContent>
      </Layout>
    )
  }
}

export default IndexRoute
