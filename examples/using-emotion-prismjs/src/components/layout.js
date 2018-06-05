import React from "react"
import { Link } from "gatsby"
import PropTypes from "prop-types"
import { css } from "react-emotion"
import Helmet from "react-helmet"

import { rhythm } from "../utils/typography"
import "../prism-styles"

const indexContainer = css`
  max-width: ${rhythm(30)};
  margin: ${rhythm(1)} auto 0;
  padding: ${rhythm(1)};
`

const link = css`
  box-shadow: none;
  text-decoration: none;
  color: inherit;
`

class Layout extends React.Component {
  render() {
    const HeadingTag = this.props.isIndex ? `h1` : `h3`
    return (
      <>
        <Helmet>
          <title>Gatsby Emotion + PrismJS</title>
          <meta
            name="description"
            content="Gatsby example site using Emotion and PrismJS"
          />
          <meta name="referrer" content="origin" />
        </Helmet>
        <div className={indexContainer}>
          <HeadingTag>
            <Link className={link} to={`/`}>
              Using Gatsby with Emotion and PrismJS
            </Link>
          </HeadingTag>
          {this.props.children}
        </div>
      </>
    )
  }
}

Layout.propTypes = {
  isIndex: PropTypes.bool,
  children: PropTypes.node.isRequired,
}

export default Layout
