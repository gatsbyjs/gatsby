import React from "react"
import { Link } from "gatsby"
import { SkipNavLink, SkipNavContent } from "@reach/skip-nav"
import "@reach/skip-nav/styles.css"

import typography from "../utils/typography"
const { rhythm } = typography

class Layout extends React.Component {
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
        <header>
          <SkipNavLink />
          <h3 style={{ marginBottom: rhythm(1.5) }}>
            Example of using{" "}
            <a href="https://reacttraining.com/reach-ui/skip-nav/#reach-skip-nav">
              @reach/skip-nav
            </a>
          </h3>
          Press tab to see the skip link.
        </header>
        <nav className="nav">
          <Link to="/">Page 1</Link> <Link to="page/2">Page 2</Link>
          {` `}
          <Link to="page/3">Page 3</Link> <Link to="page/4">Page 4</Link>
        </nav>
        <SkipNavContent />
        <main>{this.props.children}</main>
        <footer>
          © {new Date().getFullYear()}, Built with
          {` `}
          <a href="https://www.gatsbyjs.org">Gatsby</a>
        </footer>
      </div>
    )
  }
}

export default Layout
