import * as PropTypes from "prop-types"
import React from "react"
import { graphql } from "gatsby"
import PostDetail from "../components/post-detail"
import Layout from "../layouts"

class PostTemplate extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      postsJson: PropTypes.object.isRequired,
    }),
  }
  render() {
    let isModal = false
    // We don't want to show the modal if a user navigates
    // directly to a post so if this code is running on Gatsby's
    // initial render then we don't show the modal, otherwise we
    // do.
    if (
      typeof window !== `undefined` &&
      window.___GATSBYGRAM_INITIAL_RENDER_COMPLETE
    ) {
      isModal = true
    }
    return (
      <Layout location={this.props.location} isModal={isModal}>
        <PostDetail post={this.props.data.postsJson} />
      </Layout>
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
  query($id: String!) {
    # Select the post which equals this id.
    postsJson(id: { eq: $id }) {
      ...PostDetail_details
    }
  }
`
