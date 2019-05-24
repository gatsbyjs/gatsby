import React from "react"
import { graphql } from "gatsby"
import { Styled } from "theme-ui"

import Layout from "../components/layout"
import SEO from "../components/seo"

class NotFoundPage extends React.Component {
  render() {
    const { data } = this.props
    const siteTitle = data.site.siteMetadata.title

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO title="404: Not Found" />
        <Styled.h1>Not Found</Styled.h1>
        <Styled.p>
          You just hit a route that doesn&#39;t exist... the sadness.
        </Styled.p>
      </Layout>
    )
  }
}

export default NotFoundPage

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`
