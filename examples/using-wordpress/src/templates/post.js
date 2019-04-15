import React, { Component } from "react"
import { graphql } from "gatsby"
import PropTypes from "prop-types"
import PostIcons from "../components/post-icons"
import Img from "gatsby-image"
import Layout from "../layouts"

import { rhythm } from "../utils/typography"

class PostTemplate extends Component {
  render() {
    const post = this.props.data.wordpressPost

    return (
      <Layout>
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
                    const img = picture.localFile.childImageSharp.fluid
                    return (
                      <Img
                        css={{ marginBottom: rhythm(1) }}
                        key={img.src}
                        fluid={img}
                      />
                    )
                  })}
                </div>
              )
            }
            if (layout.__typename === `WordPressAcf_post_photo`) {
              const img = layout.photo.localFile.childImageSharp.fluid
              return (
                <div key={`${i}-photo`}>
                  <h2>ACF Post Photo</h2>
                  <Img
                    css={{ marginBottom: rhythm(1) }}
                    src={img.src}
                    fluid={img}
                  />
                </div>
              )
            }
            return null
          })}
      </Layout>
    )
  }
}

PostTemplate.propTypes = {
  data: PropTypes.object.isRequired,
  edges: PropTypes.array,
}

export default PostTemplate

export const pageQuery = graphql`
  query($id: String!) {
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
                  fluid(maxWidth: 680) {
                    ...GatsbyImageSharpFluid
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
                    fluid(maxWidth: 680) {
                      ...GatsbyImageSharpFluid
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
