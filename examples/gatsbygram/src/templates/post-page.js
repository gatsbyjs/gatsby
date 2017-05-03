import * as PropTypes from 'prop-types'
import React from 'react'
import PostDetail from '../components/post-detail'

class PostTemplate extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      posts: PropTypes.object.isRequired,
    }),
  }
  render() {
    return (
      // PostDetail is used for this detail page and
      // also in the modal.
      <PostDetail post={this.props.data.posts} />
    )
  }
}

export default PostTemplate

// The post template's GraphQL query. Notice the “id”
// variable which is passed in. We set this on the page
// context in gatsby-node.js.
//
// All GraphQL queries in Gatsby are run at build-time and
// loaded as plain JSON files so have minimal client cost.
export const pageQuery = graphql`
  query PostPage($id: String!) {
    # Select the post which equals this id.
    posts(id: { eq: $id }) {
      ...PostDetail_details
    }
  }
`
