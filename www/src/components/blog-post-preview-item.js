import React from "react"
import Link from "gatsby-link"
import Img from "gatsby-image"

import typography, { rhythm, scale } from "../utils/typography"
import presets, { colors } from "../utils/presets"

class BlogPostPreviewItem extends React.Component {
  render() {
    const post = this.props.post
    const avatar = post.frontmatter.author.avatar.childImageSharp.resolutions

    return (
      <article className={this.props.className} css={{ position: `relative` }}>
        <Link to={post.fields.slug}>
          <h2>{post.frontmatter.title}</h2>
          <p css={{ fontWeight: `normal` }}>
            {post.frontmatter.excerpt ? post.frontmatter.excerpt : post.excerpt}
          </p>
        </Link>
        {/* ALL margins below must be...

            - equal on opposite sides

            - at least
              wrapping div:
                marginBottom: rhythm(2), // 2.125
                marginTop: rhythm(2), // 2.125
              Img
                marginLeft: rhythm(1 / 2), // 0.5
                marginRight: rhythm(1 / 2), // 0.5

            ...to prevent avatar hover twitching.

            <3 @rdela
        */}
        <div
          css={{
            display: `flex`,
            alignItems: `center`,
            marginTop: rhythm(2),
            marginBottom: rhythm(2),
          }}
        >
          <Link
                to={post.frontmatter.author.fields.slug}
                css={{
                  boxShadow: `none !important`,
                  borderBottom: `0 !important`,
                  position: `relative`,
                  zIndex: 1,
                  "&&": {
                    fontWeight: `normal`,
                    ":hover": {
                      background: `transparent`,
                    },
                  },
                }}
              >
          <Img
            alt=""
            resolutions={avatar}
            css={{
              borderRadius: `100%`,
              display: `inline-block`,
              // marginBottom: 0,
              // marginTop: 0,
              marginRight: rhythm(1 / 32),
              marginLeft: rhythm(1 / 32),
              verticalAlign: `top`,
            }}
          /></Link>
          <div
            css={{
              display: `inline-block`,
              fontFamily: typography.options.headerFontFamily.join(`,`),
              color: colors.gray.calm,
              ...scale(-2 / 5),
              [presets.Mobile]: {
                ...scale(-1 / 5),
              },
              [presets.Desktop]: {
                ...scale(0),
              },
            }}
          >
            <div>
              <Link
                to={post.frontmatter.author.fields.slug}
                css={{
                  color: `${colors.gatsby} !important`,
                  fontSize: `102%`,
                  marginLeft: rhythm(1 / 2),
                  position: `relative`,
                  zIndex: 1,
                  "&&": {
                    fontWeight: `bold`,
                    ":hover": {
                      background: colors.ui.bright,
                    },
                  },
                }}
              >
                {post.frontmatter.author.id}
              </Link>
              {` `}
              on
              {` `}
              {post.frontmatter.date}
            </div>
          </div>
        </div>
        <Link
          to={post.fields.slug}
          css={{
            position: `absolute`,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: `hidden`,
            textIndent: `-100%`,
            whiteSpace: `nowrap`,
            zIndex: 0,
            "&&": {
              border: 0,
              boxShadow: `none`,
              "&:hover": {
                background: `none`,
              },
            },
          }}
        >
          Read more
        </Link>
      </article>
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
      date(formatString: "MMMM Do YYYY")
      author {
        id
        fields {
          slug
        }
        avatar {
          childImageSharp {
            resolutions(
              width: 30
              height: 30
              quality: 80
              traceSVG: {
                turdSize: 10
                background: "#f6f2f8"
                color: "#e0d6eb"
              }
            ) {
              ...GatsbyImageSharpResolutions_tracedSVG
            }
          }
        }
      }
    }
  }
`
