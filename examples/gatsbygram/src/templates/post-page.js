import React from "react"
import PostDetail from "../components/post-detail"

class PostTemplate extends React.Component {
  render() {
    return (
      // PostDetail is used for this detail page and
      // also in the modal.
      <PostDetail post={this.props.data.postsJson} />
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
export const pageQuery = `
  query PostPageJson($id: String!) {
    # Select the post which equals this id.
    postsJson(id: { eq: $id }) {
      # Specify the fields from the post we need.
      username
      avatar
      likes
      id
      text
      # Date fields have special arguments. This one computes
      # how many weeks have passed since the post was created.
      # All calculations like this (like all GraphQL query
      # activity) happens at build-time! So has minimal cost
      # for the client.
      weeksAgo: time(difference: "weeks")
      image {
        childImageSharp {
          # Here we query for *multiple* image thumbnails to be
          # created. So with no effort on our part, 100s of
          # thumbnails are created. This makes iterating on
          # designs effortless as we simply change the args
          # for the query and we get new thumbnails.
          big: responsiveSizes(maxWidth: 640) {
            src
            srcSet
          }
        }
      }
    }
  }
`
