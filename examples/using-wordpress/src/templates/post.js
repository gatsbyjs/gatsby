import React, { Component } from "react"
import PropTypes from "prop-types"

import Helmet from "react-helmet"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { H1, Row, Page, Column } from "../components/styled"

class PostTemplate extends Component {
  render() {
    // console.log(`this.props is`, this.props)

    const post = this.props.data.wordpressPost
    const wordpressPages = this.props.data.allWordpressPage
    const siteMetadata = this.props.data.site.siteMetadata

    return (
      <div>
        <Page>
          <Row>
            <Helmet title={siteMetadata.title} />
            <Header
              title={siteMetadata.title}
              subtitle={siteMetadata.subtitle}
              pages={wordpressPages}
            />
          </Row>
          <Row>
            <H1 dangerouslySetInnerHTML={{ __html: post.title }} />
          </Row>
          <Row>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </Row>
          <Row>
            <Footer />
          </Row>
        </Page>
      </div>
    )
  }
}
//<img src={post.image.sizes.thumbnail} />

PostTemplate.propTypes = {
  data: PropTypes.object.isRequired,
  edges: PropTypes.array,
}

export default PostTemplate

export const pageQuery = graphql`
  query currentPostQuery($id: String!) {
    wordpressPost(id: { eq: $id }) {
      id
      slug
      title
      content
      excerpt
      date
      date_gmt
      modified
      modified_gmt
      status
      author
      featured_media
      comment_status
      ping_status
      sticky
      template
      format
      categories
      tags
    }
    allWordpressPage {
      edges {
        node {
          id
          title
          content
          excerpt
          date
          date_gmt
          modified
          modified_gmt
          slug
          status
          author
          featured_media
          menu_order
          comment_status
          ping_status
          template
        }
      }
    }
    allWordpressPost {
      edges {
        node {
          id
          slug
          title
          content
          excerpt
          date
          date_gmt
          modified
          modified_gmt
          status
          author
          featured_media
          comment_status
          ping_status
          sticky
          template
          format
          categories
          tags
        }
      }
    }
    site {
      id
      siteMetadata {
        title
        subtitle
      }
    }
  }
`
