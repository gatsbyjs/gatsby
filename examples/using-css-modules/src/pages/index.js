import React from "react"
import { Link } from "gatsby"

import { index, subheader, link } from "../styles/index.module.css"

class IndexComponent extends React.Component {
  render() {
    return (
      <div className={index}>
        <h1>Hello world</h1>
        <h2 className={subheader}>
          {`You've`} arrived at the world renowned css modules & gatsby example
          site
        </h2>
        <p>
          <Link className={link} to="/another-page/">
            Travel through the cyber linkspace
          </Link>
        </p>
        <p>
          <Link className={link} to="/sassy-page/">
            Partake of sassy goodness
          </Link>
        </p>
        <p>
          <a
            className={link}
            href="https://github.com/gatsbyjs/gatsby/tree/master/examples/using-css-modules"
          >
            Code for example site on GitHub
          </a>
        </p>
      </div>
    )
  }
}

export default IndexComponent
