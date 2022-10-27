import React, { Fragment } from "react"
import { Link, StaticQuery, graphql } from "gatsby"
import PropTypes from "prop-types"
import { css } from "@emotion/css"
import { Helmet } from "react-helmet"

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

// TODO(v6): Refactor this to a function component
class PureLayout extends React.Component {
  render() {
    const HeadingTag = this.props.isIndex ? `h1` : `h3`
    const { siteTitle, pageTitle } = this.props
    const title = pageTitle ? `${pageTitle} — ${siteTitle}` : `${siteTitle}`

    return (
      <Fragment>
        <Helmet>
          <title>{title}</title>
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
      </Fragment>
    )
  }
}

PureLayout.propTypes = {
  siteTitle: PropTypes.string.isRequired,
  pageTitle: PropTypes.string,
  isIndex: PropTypes.bool,
  children: PropTypes.node.isRequired,
}

const query = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`

// TODO(v6): Refactor to use `useStaticQuery` instead of `StaticQuery`, `StaticQuery` will be removed in v6
const Layout = props => (
  <StaticQuery
    query={query}
    render={data => (
      <PureLayout siteTitle={data.site.siteMetadata.title} {...props} />
    )}
  />
)

export default Layout
