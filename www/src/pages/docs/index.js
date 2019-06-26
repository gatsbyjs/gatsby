import React from "react"
import { Link } from "gatsby"
import { Helmet } from "react-helmet"

import Layout from "../../components/layout"
import { itemListDocs } from "../../utils/sidebar/item-list"
import Container from "../../components/container"
import EmailCaptureForm from "../../components/email-capture-form"
import DocSearchContent from "../../components/docsearch-content"
import FooterLinks from "../../components/shared/footer-links"
import Breadcrumb from "../../components/docs-breadcrumb"

class IndexRoute extends React.Component {
  render() {
    return (
      <Layout location={this.props.location} itemList={itemListDocs}>
        <DocSearchContent>
          <Container>
            <Helmet>
              <title>Docs</title>
              <meta
                name="description"
                content="The one stop location for tutorials, guides, and information about building with Gatsby"
              />
            </Helmet>
            <Breadcrumb itemList={itemListDocs} location={location} />
            <h1 id="gatsby-documentation" css={{ marginTop: 0 }}>
              Gatsby.js Documentation
            </h1>
            <p>Gatsby is a blazing fast modern site generator for React.</p>
            <h2>Get Started</h2>
            <p>There are five main ways to get started with Gatsby:</p>
            <ol>
              <li>
                <Link to="/tutorial/">Tutorials</Link>: Step-by-step
                instructions on how to install Gatsby and start a project:
                written for people without Gatsby or web development experience,
                though these learning resources have helped developers of all
                skill levels.
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
                    <Link to="/docs/guides/">Reference Guides</Link>: Learn
                    about the many different topics around building with Gatsby,
                    like sourcing data, deployment, and more.
                  </li>
                  <li>
                    <Link to="/docs/api-reference/">Gatsby API Reference</Link>:
                    Learn more about Gatsby APIs and configuration.
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
                    <Link to="/docs/gatsby-internals/">Gatsby Internals</Link>:
                    Dig into how Gatsby works behind the scenes.
                  </li>
                  <li>
                    <Link to="/docs/using-gatsby-professionally/">
                      Using Gatsby Professionally
                    </Link>
                    : Learn tips and tricks for how to explain Gatsby to others
                    at work, so that you have more opportunities to work with
                    Gatsby professionally.
                  </li>
                </ul>
              </li>
              <li>
                Check out the <Link to="/ecosystem/">Ecosystem</Link> libraries
                for Gatsby starters and plugins, as well as external community
                resources.
              </li>
            </ol>
            <p>
              Visit the <Link to="/contributing">Contributing</Link> section to
              find guides on the Gatsby community, code of conduct, and how to
              get started contributing to Gatsby.
            </p>
            <EmailCaptureForm signupMessage="Want to keep up with the latest tips &amp; tricks? Subscribe to our newsletter!" />
          </Container>
          <FooterLinks />
        </DocSearchContent>
      </Layout>
    )
  }
}

export default IndexRoute
