import React from "react"
import Link from "gatsby-link"

import typography, { rhythm, scale } from "../utils/typography"
import presets from "../utils/presets"

class BlogPostPreviewItem extends React.Component {
  render() {
    const post = this.props.post
    const avatar =
      post.frontmatter.author.avatar.childImageSharp.responsiveResolution

    return (
      <div css={{ marginBottom: rhythm(2) }}>
        <Link to={post.fields.slug}>
          <h2
            css={{
              marginBottom: rhythm(1 / 8),
            }}
          >
            {post.frontmatter.title}
          </h2>
          <p>
            {post.frontmatter.excerpt ? post.frontmatter.excerpt : post.excerpt}
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
              fontFamily: typography.options.headerFontFamily.join(`,`),
              color: presets.calm,
              ...scale(-2 / 5),
              lineHeight: 1.3,
              [presets.Mobile]: {
                ...scale(-1 / 5),
                lineHeight: 1.3,
              },
            }}
          >
            <div>{post.frontmatter.author.id}</div>
            <div>{post.frontmatter.date}</div>
          </div>
        </div>
      </div>
    )
  }
}

export default BlogPostPreviewItem

export const blogPostPreviewFragment = graphql`
  fragment BlogPostPreview_item on MarkdownRemark {
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
            responsiveResolution(width: 36, height: 36) {
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
`
