/*
See the notes in future-blog-post.js as well. This is slimmed down as this component
 does not have necessary data (no queries on layouts). We moved the blog post type components
 into templates/markdown.js and into EACH javascript file itself.
*/

import React from 'react';
import Link from 'gatsby-link';
import siteMetadata from '../components/metadata.yaml';

class BlogPostTemplate extends React.Component {
  render() {
      let frontmatter = this.props.data;
      // let siteMetadata = this.props.siteMetadata;

      const home = (
        <div className='nav'>
          <div className='container'>
            <div className='nav-left'>
              <Link
                className='nav-item is-tab is-active'
                to={ '/' }>
                Home
              </Link>
            </div>
          </div>
        </div>
      );



      return (
          <div className='ArticleTemplate'>
            { home }
            <div className='container'>
              { this.props.children() }
            </div>
            <div className='footer container'>
              <hr />
              <p>
                { siteMetadata.siteDescr }
                <a href={ siteMetadata.siteTwitterUrl }>
                  <br></br> <strong>{ siteMetadata.siteAuthor }</strong> on Twitter</a>
              </p>
            </div>
          </div>
          );
  }
}

export default BlogPostTemplate;
