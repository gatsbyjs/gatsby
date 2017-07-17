import React from "react"
import Link from "gatsby-link"

class IndexPage extends React.Component {
  render() {
    return (
      <div
        css={{
          margin: `0 auto`,
          marginTop: `3rem`,
          padding: `1.5rem`,
          maxWidth: 800,
          color: `red`,
        }}
      >
        <h1>Using Glamor + Gatsby</h1>
        <p>
          <a href="https://www.gatsbyjs.org/docs/packages/gatsby-plugin-glamor/">
            gatsby-plugin-glamor docs
          </a>
        </p>
        <p css={{ color: `blue` }}>This is some cool stuff</p>
        <p
          css={{
            color: `pink`,
            "@media (min-width: 750px)": { color: `blue` },
          }}
        >
          Make the screen narrower, on smaller screens I turn pink!
        </p>
        <p css={{ fontStyle: `italic` }}>
          Edit me in your text editor, changes to styles hot reload!
        </p>
        <Link to="/other-page/">Go exploring</Link>
      </div>
    )
  }
}

export default IndexPage
