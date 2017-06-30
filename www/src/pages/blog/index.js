import React from "react"
import Link from "gatsby-link"
import styled from "styled-components"
import colors from "../../utils/colors"

import { rhythm, scale } from "../../utils/typography"
import presets from "../../utils/presets"
import Container from "../../components/container"

// More obvious that potentially your h1 styles shouldn't
// have margin by default?
const H1 = styled.h1`
  margin-top: 0;
`

// This could also be a direct-descendant selector on the parent:
// e.g. <Container vertical spaced> ...
const Post = styled.div`
  margin-bottom: ${rhythm(2)};
`

// This is the third component that only sets margin? To me that
// indicates a opportunity for refactoring your base styles.
const Title = styled.h2`
  margin-bottom: ${rhythm(1 / 8)};
`

// Names can be as simple as the data they're displaying.
const Excerpt = styled.p`
  color: ${colors.b[13]};
`
const Avatar = styled.img`
  border-radius: 100%;
  display: inline-block;
  margin-right: ${rhythm(1 / 2)};
  margin-bottom: 0;
  vertical-align: top;
`

// The first time I had to actually invent a name.
// You might prefer to have a generic <Block inline>
// component instead (if this component is truly only
// structural and not semantic)
const Caption = styled.div`
  display: inline-block;
`

// Not sure why this can't just be a styled.small
// but I decided to reproduce exactly what was there
// previously.
const Author = styled.div`
  color: ${colors.b[12]};
  line-height: 1.1;
`

// Again, potentially you can remove the <small>
// and <em> elements in the markup now.
const Date = styled.div`
  color: ${colors.b[12]};
  line-height: 1.1;
`

class BlogPostsIndex extends React.Component {
  render() {
    const blogPosts = this.props.data.allMarkdownRemark.edges.map(
      edge => edge.node
    )
    return (
      <Container>
        <H1>Blog</H1>
        {blogPosts.map(post => {
          const avatar =
            post.frontmatter.author.avatar.childImageSharp.responsiveResolution
          return (
            <Post key={post.fields.slug}>
              <Link to={post.fields.slug}>
                <Title>
                  {post.frontmatter.title}
                </Title>
                <Excerpt>
                  {post.frontmatter.excerpt
                    ? post.frontmatter.excerpt
                    : post.excerpt}
                </Excerpt>
              </Link>
              <div>
                <Avatar
                  alt={`Avatar for ${post.frontmatter.author.id}`}
                  src={avatar.src}
                  srcSet={avatar.srcSet}
                  height={avatar.height}
                  width={avatar.width}
                />
                <Caption>
                  <Author>
                    <small>
                      {post.frontmatter.author.id}
                    </small>
                  </Author>
                  <Date>
                    <small>
                      <em>
                        {post.frontmatter.date}
                      </em>
                    </small>
                  </Date>
                </Caption>
              </div>
            </Post>
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
      sort: { order: DESC, fields: [frontmatter___date] }
      filter: {
        frontmatter: { draft: { ne: true } }
        fileAbsolutePath: { regex: "/blog/" }
      }
    ) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            excerpt
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
