import * as PropTypes from "prop-types"
import React from "react"
import PostDetail from "../components/post-detail"

class PostTemplate extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      dataJson: PropTypes.object.isRequired,
    }),
    pathContext: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }),
  }
  render() {
    return (
      // PostDetail is used for this detail page and
      // also in the modal.
      // FIXME: definitely shouldn't do the filtering here...
      <PostDetail
        post={this.props.data.dataJson.posts.filter(
          p => p.id === this.props.pathContext.id
        )}
        username={this.props.data.dataJson.username}
        avatar={this.props.data.dataJson.avatar}
      />
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
// FIXME: can't for my life figure out how to make this work 😿
// export const pageQuery = graphql`
//   query PostPage($id: String!) {
//     # Select the post which equals this id.
//     postsJson(id: { eq: $id }) {
//       ...PostDetail_details
//     }
//   }
// `
export const pageQuery = graphql`
  query PostPage {
    dataJson {
      username
      avatar
      posts {
        ...PostDetail_details
      }
    }
  }
`
