import React from "react"
import { Link, graphql } from "gatsby"
import Img from "gatsby-image"

import typography, { rhythm, scale } from "../utils/typography"
import presets, { colors } from "../utils/presets"

const BlogPostPreviewItem = ({ post, className }) => {
  const avatar = post.frontmatter.author.avatar.childImageSharp.fixed

  return (
    <article className={className} css={{ position: `relative` }}>
      <Link to={post.fields.slug}>
        <h2>{post.frontmatter.title}</h2>
        <p css={{ fontWeight: `normal` }}>
          {post.frontmatter.excerpt ? post.frontmatter.excerpt : post.excerpt}
        </p>
      </Link>
      <div
        css={{
          display: `flex`,
          alignItems: `center`,
          marginBottom: rhythm(2),
        }}
      >
        <Link
          to={post.frontmatter.author.fields.slug}
          css={{
            position: `relative`,
            zIndex: 1,
            "&&": {
              boxShadow: `none`,
              borderBottom: `0`,
              fontWeight: `normal`,
              ":hover": {
                background: `transparent`,
              },
            },
          }}
        >
          <Img
            alt=""
            fixed={avatar}
            css={{
              borderRadius: `100%`,
              display: `inline-block`,
              marginRight: rhythm(1 / 2),
              marginBottom: 0,
              verticalAlign: `top`,
              // prevents image twitch in Chrome when hovering the card
              transform: `translateZ(0)`,
            }}
          />
        </Link>
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
                position: `relative`,
                zIndex: 1,
                "&&": {
                  color: `${colors.gatsby}`,
                  fontWeight: `normal`,
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
            fixed(
              width: 30
              height: 30
              quality: 80
              traceSVG: {
                turdSize: 10
                background: "#f6f2f8"
                color: "#e0d6eb"
              }
            ) {
              ...GatsbyImageSharpFixed_tracedSVG
            }
          }
        }
      }
    }
  }
`

export default BlogPostPreviewItem
