import React, { Component } from "react"
import PropTypes from "prop-types"

import Helmet from "react-helmet"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { H1, Row, Page, Column } from "../components/styled"

class PageTemplate extends Component {
  render() {
    const siteMetadata = this.props.data.site.siteMetadata
    const currentPage = this.props.data.wordpressPage

    return (
      <div>
        <Page>
          <Row>
            <H1 dangerouslySetInnerHTML={{ __html: currentPage.title }} />
          </Row>
          <Row>
            <div dangerouslySetInnerHTML={{ __html: currentPage.content }} />
          </Row>
          <Row>
            <Footer />
          </Row>
        </Page>
      </div>
    )
  }
}
//<img src={currentPage.image.sizes.thumbnail} />

PageTemplate.propTypes = {
  data: PropTypes.object.isRequired,
  edges: PropTypes.array,
}

export default PageTemplate

export const pageQuery = graphql`
  query currentPageQuery($id: String!) {
    wordpressPage(id: { eq: $id }) {
      id
      title
      content
      excerpt
      date
      modified
      slug
      status
      author {
        name
      }
      featured_media
      menu_order
      comment_status
      ping_status
      template
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
