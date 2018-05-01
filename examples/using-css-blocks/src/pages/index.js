import React from "react"
import { Link } from "gatsby"
import styles from './index.block.css'

class IndexPage extends React.Component {
  render() {
    return (
      <div className={styles}>
        <h1>Using CSS Blocks + Gatsby</h1>
        <p>
          <a href="https://www.gatsbyjs.org/packages/gatsby-plugin-css-blocks/">
            gatsby-plugin-css-blocks docs
          </a>
        </p>
        <p className={styles.p1}>This is some cool stuff</p>
        <p className={styles.p2}>
          Make the screen narrower, on smaller screens I turn pink!
        </p>
        <p className={styles.p3}>
          Edit me in your text editor, changes to styles hot reload!
        </p>
        <Link to="/other-page/">Go exploring</Link>
      </div>
    )
  }
}

export default IndexPage
