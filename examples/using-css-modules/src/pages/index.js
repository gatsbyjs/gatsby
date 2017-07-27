import React from 'react'
import Link from 'gatsby-link'

import indexStyles from '../styles/index.module.css'

class IndexComponent extends React.Component {
  render() {
    return (
      <div className={indexStyles.index}>
        <h1>Hello world</h1>
        <h2 className={indexStyles.subheader}>
          You've arrived at the world renowned css modules & gatsby example site
        </h2>
        <p>
          <Link className={indexStyles.link} to="/another-page/">
            Travel through the cyber linkspace
          </Link>
        </p>
        <p>
          <Link className={indexStyles.link} to="/sassy-page/">
            Partake of sassy goodness
          </Link>
        </p>
        <p>
          <a
            className={indexStyles.link}
            href="https://github.com/gatsbyjs/gatsby/tree/master/examples/using-css-modules"
          >
            cODe for eXAMple sIte on GiTHUb
          </a>
        </p>
      </div>
    )
  }
}

export default IndexComponent
