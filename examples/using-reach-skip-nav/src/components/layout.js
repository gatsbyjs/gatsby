import React from "react"
import { Link } from "gatsby"
import { SkipNavLink, SkipNavContent } from "@reach/skip-nav"
import "@reach/skip-nav/styles.css"

import typography from "../utils/typography"
const { rhythm } = typography

class DefaultLayout extends React.Component {
  render() {
    return (
      <div
        style={{
          margin: `0 auto`,
          marginTop: rhythm(1.5),
          marginBottom: rhythm(1.5),
          maxWidth: "80%",
          paddingLeft: rhythm(3 / 4),
          paddingRight: rhythm(3 / 4),
        }}
      >
        <SkipNavLink />
        <h3 style={{ color: `tomato`, marginBottom: rhythm(1.5) }}>
          Example of using{" "}
          <a href="https://reacttraining.com/reach-ui/skip-nav/#reach-skip-nav">
            @reach/skip-nav
          </a>
        </h3>
        Press tab to see the skip link.
        <SkipNavContent />
        {this.props.children}
      </div>
    )
  }
}

export default DefaultLayout
