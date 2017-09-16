import React, { Component } from "react"
import PropTypes from "prop-types"

import Helmet from "react-helmet"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { H1, Row, Page, Column } from "../components/styled"

class PostTemplate extends Component {
  render() {
    const post = this.props.data.wordpressPost
    console.log(post)

    return (
      <div>
        <h1 dangerouslySetInnerHTML={{ __html: post.title }} />
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
        {post.childWordPressAcfImageGallery && <h2>Image Gallery</h2>}
        {post.childWordPressAcfImageGallery &&
          post.childWordPressAcfImageGallery.pictures.map(({ picture }) => {
            console.log(picture)
            const img = picture.localFile.childImageSharp.responsiveResolution
            return (
              <img
                src={img.src}
                srcSet={img.srcSet}
                width={img.width}
                height={img.height}
                style={{ marginRight: 10 }}
              />
            )
          })}
        {post.childWordPressAcfPostPhoto && <h2>Post Photo</h2>}
        {post.childWordPressAcfPostPhoto &&
          (() => {
            console.log(post.childWordPressAcfPostPhoto)
            const img =
              post.childWordPressAcfPostPhoto.photo.localFile.childImageSharp
                .responsiveResolution
            return (
              <img
                src={img.src}
                srcSet={img.srcSet}
                width={img.width}
                height={img.height}
                style={{ marginRight: 10 }}
              />
            )
          })()}
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
      childWordPressAcfPostPhoto {
        photo {
          localFile {
            childImageSharp {
              responsiveResolution(width: 300) {
                width
                height
                src
                srcSet
              }
            }
          }
        }
      }
      childWordPressAcfImageGallery {
        pictures {
          title
          picture {
            localFile {
              childImageSharp {
                responsiveResolution(width: 300) {
                  width
                  height
                  src
                  srcSet
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
