import React, { Component } from "react"
import PropTypes from "prop-types"
import PostIcons from "../components/PostIcons"
import Img from "gatsby-image"

import { rhythm } from "../utils/typography"

class PostTemplate extends Component {
  render() {
    const post = this.props.data.wordpressPost

    return (
      <div>
        <h1 dangerouslySetInnerHTML={{ __html: post.title }} />
        <PostIcons node={post} css={{ marginBottom: rhythm(1 / 2) }} />
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
        {post.acf &&
          post.acf.page_builder_post &&
          post.acf.page_builder_post.map((layout, i) => {
            if (layout.__typename === `WordPressAcf_image_gallery`) {
              return (
                <div key={`${i} image-gallery`}>
                  <h2>ACF Image Gallery</h2>
                  {layout.pictures.map(({ picture }) => {
                    const img = picture.localFile.childImageSharp.sizes
                    return (
                      <Img
                        css={{ marginBottom: rhythm(1) }}
                        key={img.src}
                        sizes={img}
                      />
                    )
                  })}
                </div>
              )
            }
            if (layout.__typename === `WordPressAcf_post_photo`) {
              const img = layout.photo.localFile.childImageSharp.sizes
              return (
                <div key={`${i}-photo`}>
                  <h2>ACF Post Photo</h2>
                  <Img
                    css={{ marginBottom: rhythm(1) }}
                    src={img.src}
                    sizes={img}
                  />
                </div>
              )
            }
            return null
          })}
      </div>
    )
  }
}
//<img src={post.image.sizes.thumbnail} />

PostTemplate.propTypes = {
  data: PropTypes.object.isRequired,
  edges: PropTypes.array,
}

export default PostTemplate

export const pageQuery = graphql`
  query currentPostQuery($id: String!) {
    wordpressPost(id: { eq: $id }) {
      title
      content
      ...PostIcons
      acf {
        page_builder_post {
          __typename
          ... on WordPressAcf_post_photo {
            photo {
              localFile {
                childImageSharp {
                  sizes(maxWidth: 680) {
                    ...GatsbyImageSharpSizes
                  }
                }
              }
            }
          }
          ... on WordPressAcf_image_gallery {
            pictures {
              picture {
                localFile {
                  childImageSharp {
                    sizes(maxWidth: 680) {
                      ...GatsbyImageSharpSizes
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    site {
      siteMetadata {
        title
        subtitle
      }
    }
  }
`
