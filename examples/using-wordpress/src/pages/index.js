import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet'
import Header from '../components/Header';
import Footer from '../components/Footer';
import PostsListSearchable from '../components/PostsListSearchable'
import { H1, Row, Page, Column } from '../components/styled';

class Home extends Component {

  render() {
    // this.props is where all the data of my site lives: { data, history, location. match... }
    // much of this if from the router, but data object is where all my api data lives

    const wordpressPages = this.props.data.allWordpressPage
    const siteMetadata = this.props.data.site.siteMetadata
    const currentPage = this.props.data.wordpressPage

    return (
      <div>
        <Page>
          <Row>
            <Helmet title={siteMetadata.title} />
            <Header title={siteMetadata.title} subtitle={siteMetadata.subtitle} pages={wordpressPages} />
          </Row>
          <Row>
            <H1 dangerouslySetInnerHTML={{ __html: currentPage.title }}></H1>
            <div dangerouslySetInnerHTML={{ __html: currentPage.content }} />
            <PostsListSearchable propsData={this.props.data} />
          </Row>
          <Row>
            <Footer />
          </Row>
        </Page>
      </div>
    )
  }
}


export default Home;

Home.propTypes = {
  data: PropTypes.object.isRequired,
  allWordpressPage: PropTypes.object,
  edges: PropTypes.array
}

// Set here the ID of the home page.
export const pageQuery = graphql`
query homePageQuery {

  wordpressPage(id: {eq: "PAGE_5"}) {
        id
        order
        created
        changed
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

  allWordpressPage{
    edges {
      node {
        id
        order
        created
        changed
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
        order
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

  allWordpressTag {
    edges {
      node {
        id
        slug
        order
        description
        name
        taxonomy
      }
    }
  }


  allWordpressCategory {
    edges {
      node {
        id
        order
        description
        name
        slug
        taxonomy
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