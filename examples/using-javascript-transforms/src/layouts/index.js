import React from 'react';
import * as PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import siteMetadata from '../components/metadata.yaml';
import '../static/css/base.scss';

import InsetPage from "./inset-page"
import BlogPost from "./blog-post"

class MasterLayout extends React.Component {
  render() {
    let location = this.props.location.pathname
    let jimmyPage // you jimmy a lock until it opens, so same thing here ;)
    // It would be ideal to run a graphql query to use the layoutType, but
    //  layouts do not yet have that support.
    if (location === `/`) {
      jimmyPage = this.props.children()
    } else if (location === `/about` || location === `/contact`) {
      jimmyPage = <InsetPage {...this.props} />
    } else {
      jimmyPage = <BlogPost {...this.props} />
    }

    return (
      <div className="MasterLayout">
        <Helmet
          defaultTitle={siteMetadata.title}
          meta={[
            { name: `description`, content: `A super fancy blog example` },
            { name: `keywords`, content: `articles` },
          ]}
        />
        {jimmyPage}
      </div>
    )
  }
}

export default MasterLayout

// this is a placeholder, does not actually work
/*
export const pageQuery = graphql`
  query LayoutBySlug($slug: String!) {
    allJsFrontmatter {
      edges {
        node {
          data {
            layoutType
          }
        }
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        layoutType
      }
    }
  }
`
*/
