import React from 'react';
import Helmet from 'react-helmet'
import Header from '../components/Header';
import Footer from '../components/Footer';
import { H1, Row, Page, Column } from '../components/styled';

class PostTemplate extends React.Component {

  render() {
    const post = this.props.data.wordpressPost;

    const wordpressPages = this.props.data.allWordpressPage

    const siteMetadata = this.props.data.site.siteMetadata

    return (
      <div>
        <Page>
          <Row>
            <Helmet title={siteMetadata.title} />
            <Header title={siteMetadata.title} subtitle={siteMetadata.subtitle} pages={wordpressPages} />
          </Row>
          <Row>
            <H1 dangerouslySetInnerHTML={{ __html: post.title }}></H1>            
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


export default PostTemplate

export const pageQuery = graphql`
  query currentPostQuery($id: String!) {

    wordpressPost(id: {eq: $id}) {
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


  allWordpressPage {
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