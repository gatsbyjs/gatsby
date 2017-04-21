import React from "react"
import Helmet from "react-helmet"

import presets from "../utils/presets"
import typography, { rhythm, scale } from "../utils/typography"

const BlogPostTemplate = React.createClass({
  render() {
    console.log(this.props)
    const post = this.props.data.markdownRemark
    const twitterLine = post.frontmatter.author.twitter
      ? ` by ${post.frontmatter.author.twitter}`
      : ``
    const authorShareText = encodeURIComponent(
      `“${post.frontmatter.title}”${twitterLine} https://sourceforge.com/blog${post.fileSlug}`
    )
    const BioLine = ({ children }) => (
      <p
        css={{
          ...scale(-2 / 5),
          fontFamily: typography.options.headerFontFamily.join(`,`),
          lineHeight: 1.3,
          margin: 0,
          color: `rgba(0,0,0,.44)`,
          [presets.Mobile]: {
            ...scale(-1 / 5),
            lineHeight: 1.3,
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
        {/* Add long list of social meta tags */}
        <Helmet
          title={post.frontmatter.title}
          link={[
            {
              rel: `canonical`,
              href: `https://gatsbyjs.org${post.fileSlug}`,
            },
            {
              rel: `author`,
              href: `https://gatsbyjs.org${post.frontmatter.author.slug}`,
            },
          ]}
          meta={[
            {
              name: `description`,
              content: post.excerpt,
            },
            {
              name: `og:description`,
              content: post.excerpt,
            },
            {
              name: `twitter:description`,
              content: post.excerpt,
            },
            {
              name: `og:title`,
              content: post.frontmatter.title,
            },
            {
              name: `og:image`,
              content: post.frontmatter.image.children[0].resize.src,
            },
            {
              name: `og:type`,
              content: `article`,
            },
            {
              name: `article:author`,
              content: post.frontmatter.author.id,
            },
            {
              name: `twitter:creator`,
              content: post.frontmatter.author.twitter,
            },
            {
              name: `author`,
              content: post.frontmatter.author.id,
            },
            {
              name: `twitter:label1`,
              content: `Reading time`,
            },
            {
              name: `twitter:data1`,
              content: `${post.timeToRead} min read`,
            },
            {
              name: `article:published_time`,
              content: post.frontmatter.rawDate,
            },
          ]}
        />
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
              src={
                post.frontmatter.author.avatar.children[0].responsiveResolution
                  .src
              }
              srcSet={
                post.frontmatter.author.avatar.children[0].responsiveResolution
                  .srcSet
              }
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
              marginLeft: rhythm(1 / 2),
            }}
          >
            <h4
              css={{
                ...scale(1 / 5),
                lineHeight: 1.1,
                fontWeight: 400,
                fontStyle: `normal`,
                margin: 0,
              }}
            >
              {post.frontmatter.author.id}
            </h4>
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
  query TemplateBlogPost($slug: String!) {
    markdownRemark(slug: { eq: $slug }) {
      html
      excerpt
      timeToRead
      slug
      frontmatter {
        title
        date(formatString: "MMM D, YYYY")
        rawDate: date
        image {
          children {
            ... on ImageSharp {
              resize(width: 1500) {
                src
              }
            }
          }
        }
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
