import React from "react"
import Link from "gatsby-link"
import colors from "../../utils/colors"

import { rhythm, scale } from "../../utils/typography"
import presets from "../../utils/presets"
import Container from "../../components/container"

class BlogPostsIndex extends React.Component {
  render() {
    const blogPosts = this.props.data.allMarkdownRemark.edges.map(
      edge => edge.node
    )
    return (
      <Container>
        <h1 css={{ marginTop: 0 }}>Blog</h1>
        {blogPosts.map(post => {
          const avatar =
            post.frontmatter.author.avatar.childImageSharp.responsiveResolution
          return (
            <div key={post.fields.slug}>
              <Link to={post.fields.slug}>
                <h2
                  css={{
                    marginBottom: rhythm(1 / 8),
                  }}
                >
                  {post.frontmatter.title}
                </h2>
                <p
                  css={{
                    color: colors.b[13],
                  }}
                >
                  {post.excerpt}
                </p>
              </Link>
              <div>
                <img
                  alt={`Avatar for ${post.frontmatter.author.id}`}
                  src={avatar.src}
                  srcSet={avatar.srcSet}
                  height={avatar.height}
                  width={avatar.width}
                  css={{
                    borderRadius: `100%`,
                    display: `inline-block`,
                    marginRight: rhythm(1 / 2),
                    marginBottom: 0,
                    verticalAlign: `top`,
                  }}
                />
                <div
                  css={{
                    display: `inline-block`,
                  }}
                >
                  <div
                    css={{
                      color: colors.b[12],
                      lineHeight: 1.1,
                    }}
                  >
                    <small>{post.frontmatter.author.id}</small>
                  </div>
                  <div
                    css={{
                      color: colors.b[12],
                      lineHeight: 1.1,
                    }}
                  >
                    <small><em>{post.frontmatter.date}</em></small>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </Container>
    )
  }
}

export default BlogPostsIndex

export const pageQuery = graphql`
query BlogPostsIndexQuery {
  allMarkdownRemark(
    sort: { order: DESC, fields: [frontmatter___date] },
    frontmatter: { draft: { ne: true } },
    fileAbsolutePath: { regex: "/blog/" },
  ) {
    edges {
      node {
        excerpt
        fields { slug }
        frontmatter {
          title
          date(formatString: "DD MMMM, YYYY")
          author {
            id
            avatar {
              childImageSharp {
                responsiveResolution(width: 35, height: 35) {
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
  }
}
`
