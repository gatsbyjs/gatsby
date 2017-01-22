import React from 'react'
import { rhythm } from 'utils/typography'
import PostDetail from '../components/post-detail'

class ImagePage extends React.Component {
  constructor () {
    super()
  }

  render () {
    return (
      <PostDetail post={this.props.data.posts} />
    )
  }
}

export default ImagePage

export const pageQuery = `
  query PostPage($id: String!) {
    posts(id: { eq: $id }) {
      username
      likes
      id
      text
      weeksAgo: time(difference: "weeks")
      image {
        children {
          ... on ImageSharp {
            big: responsiveSizes(maxWidth: 640) {
              src
              srcSet
            }
          }
        }
      }
    }
  }
`
