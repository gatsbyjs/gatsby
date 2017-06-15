import React from "react"
import Link from "gatsby-link"

import SidebarBody from "../../components/sidebar-body"
import Container from "../../components/container"
import presets from "../../utils/presets"

class IndexRoute extends React.Component {
  render() {
    return (
      <Container>
        <h1 css={{ marginTop: 0 }}>
          Get started
        </h1>
        <p>
          Gatsby is a blazing fast static site generator for React.
        </p>
        <h2>Install Gatsby's command line tool</h2>
        <p>
          <code>
            npm install -g gatsby@next
          </code>
        </p>
        <h2>Using the Gatsby CLI</h2>
        <ol>
          <li>
            Create a new site (with the blog starter)
            {" "}
            <code>
              gatsby new beta-test-gatsby-site
              new test gatsbyjs/gatsby-starter-blog#1.0
            </code>
          </li>
          <li><code>cd beta-test-gatsby-site</code></li>
          <li>
            <code>gatsby develop</code> — Gatsby will start a hot-reloading
            development environment accessible at <code>localhost:8000</code>
          </li>
          <li>
            Try editing markdown and javascript files. Saved changes will live
            reload in the browser.
          </li>
        </ol>
        <h2>Work through the tutorial</h2>
        <p>
          Part one of what will be a 4-part tutorial is finished. It's an
          excellent way to gain a deeper understanding of how Gatsby works.
          {" "}<Link to="/tutorial">Go to the tutorial</Link>.
        </p>
        <div
          css={{
            display: `block`,
            [presets.Tablet]: {
              display: `none`,
            },
          }}
        >
          <h2>Documentation</h2>
          <SidebarBody inline />
        </div>
      </Container>
    )
  }
}

export default IndexRoute
