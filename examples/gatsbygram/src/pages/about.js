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
          <h1 data-testid="about-title">About autojewelling</h1>
          <p>
            Ghana's #1  vehicle paintwork correction/vehicle restoration.
            {` `}

          </p>
          <p>
            We make cars look better than new
            {` `}
            <a
              href="tel:+2330201008888"
              rel="noopener noreferrer"
              target="_blank"
            >
              020 100 8888
            </a>
          </p>
        </div>
      </Layout>
    )
  }
}

export default About
