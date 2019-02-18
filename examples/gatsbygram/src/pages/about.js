import React from "react"
import { rhythm } from "../utils/typography"
import Layout from "../layouts"

class About extends React.Component {
  render() {
    return (
      <Layout location={this.props.location}>
        <div
          css={{
            padding: rhythm(3 / 4),
          }}
        >
          <h1 data-testid="about-title">About Gatsbygram</h1>
          <p>
            Gatsbygram is an example website built with the JavaScript web
            framework
            {` `}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/gatsbyjs/gatsby"
            >
              Gatsby
            </a>
            .
          </p>
          <p>
            The code for the site lives at
            {` `}
            <a
              href="https://github.com/gatsbyjs/gatsby/tree/master/examples/gatsbygram"
              rel="noopener noreferrer"
              target="_blank"
            >
              https://github.com/gatsbyjs/gatsby/tree/master/examples/gatsbygram
            </a>
          </p>
          <p>
            <a href="https://www.gatsbyjs.org/blog/gatsbygram-case-study/">
              Read a case study on how Gatsbygram was built
            </a>
          </p>
        </div>
      </Layout>
    )
  }
}

export default About
