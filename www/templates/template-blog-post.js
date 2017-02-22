import React from "react"

import typography, { rhythm, scale } from "utils/typography"
import { presets } from "glamor"

const BlogPostTemplate = React.createClass({
  render () {
    console.log(this.props)
    const post = this.props.data.markdownRemark
    const twitterLine = post.frontmatter.author.twitter ? ` by ${post.frontmatter.author.twitter}` : ``
    const authorShareText = encodeURIComponent(`“${post.frontmatter.title}”${twitterLine} https://sourceforge.com/blog${post.fileSlug}`)
    const BioLine = ({ children }) => (
      <p
        css={{
          ...scale(-2/5),
          lineHeight: typography.options.baseLineHeight,
          margin: 0,
          color: `rgba(0,0,0,.44)`,
          [presets.Mobile]: {
            ...scale(-1/5),
            lineHeight: typography.options.baseLineHeight,
          },
        }}
      >
        {children}
      </p>
    )
    return (
      <div
        css={{
          margin: 0,
          maxWidth: `100%`,
          [presets.Tablet]: {
            margin: `0 auto`,
            maxWidth: rhythm(26),
          },
        }}
      >
        <header
          css={{
            display: `flex`,
            marginTop: rhythm(2),
            marginBottom: rhythm(1),
          }}
        >
          <div
            css={{
              flex: `0 0 auto`,
            }}
          >
            <img
              src={post.frontmatter.author.avatar.children[0].responsiveResolution.src}
              srcSet={post.frontmatter.author.avatar.children[0].responsiveResolution.srcSet}
              css={{
                height: rhythm(2.75),
                width: rhythm(2.75),
                margin: 0,
                borderRadius: `100%`,
                display: `inline-block`,
                verticalAlign: `middle`,
              }}
            />
          </div>
          <div
            css={{
              flex: `1 1 auto`,
              marginLeft: rhythm(1/2),
            }}
          >
            <h3
              css={{
                fontWeight: 400,
                fontStyle: `normal`,
                margin: 0,
              }}
            >
              {post.frontmatter.author.id}
            </h3>
            <BioLine>
              {post.frontmatter.author.bio}
            </BioLine>
            <BioLine>
              {post.frontmatter.date} · {post.timeToRead} min read
            </BioLine>
          </div>
        </header>
        <h1
          css={{
            marginTop: 0,
          }}
        >
          {this.props.data.markdownRemark.frontmatter.title}
        </h1>
        <div
          dangerouslySetInnerHTML={{
            __html: this.props.data.markdownRemark.html,
          }}
        />
      </div>
    )
  },
})

export default BlogPostTemplate

export const pageQuery = `
  query TemplatePage($slug: String!) {
    markdownRemark(slug: { eq: $slug }) {
      html
      excerpt
      timeToRead
      slug
      frontmatter {
        title
        date(formatString: "MMM D, YYYY")
        author {
          id
          bio
          twitter
          avatar {
            children {
              ... on ImageSharp {
                responsiveResolution(width: 75, height: 75, quality: 75) {
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
`
