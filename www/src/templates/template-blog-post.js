import React from "react"
import Helmet from "react-helmet"

import presets from "../utils/presets"
import typography, { rhythm, scale } from "../utils/typography"
import Container from "../components/container"

const BlogPostTemplate = React.createClass({
  render() {
    const post = this.props.data.markdownRemark
    const BioLine = ({ children }) =>
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
    return (
      <Container>
        {/* Add long list of social meta tags */}
        <Helmet
          title={post.frontmatter.title}
          link={[
            {
              rel: `author`,
              href: `https://gatsbyjs.org${post.frontmatter.author.slug}`,
            },
          ]}
          meta={[
            {
              name: `description`,
              content: post.frontmatter.excerpt
                ? post.frontmatter.excerpt
                : post.excerpt,
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
              content: post.frontmatter.image.childImageSharp.resize.src,
            },
            {
              name: `twitter:image`,
              content: post.frontmatter.image.childImageSharp.resize.src,
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
            marginTop: rhythm(-1 / 4),
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
                post.frontmatter.author.avatar.childImageSharp
                  .responsiveResolution.src
              }
              srcSet={
                post.frontmatter.author.avatar.childImageSharp
                  .responsiveResolution.srcSet
              }
              css={{
                height: rhythm(2.5),
                width: rhythm(2.5),
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
      </Container>
    )
  },
})

export default BlogPostTemplate

export const pageQuery = graphql`
  query TemplateBlogPost($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      excerpt
      timeToRead
      fields {
        slug
      }
      frontmatter {
        title
        excerpt
        date(formatString: "MMM D, YYYY")
        rawDate: date
        image {
          childImageSharp {
            resize(width: 1500, height: 1500) {
              src
            }
          }
        }
        author {
          id
          bio
          twitter
          avatar {
            childImageSharp {
              responsiveResolution(width: 63, height: 63, quality: 75) {
                src
                srcSet
              }
            }
          }
        }
      }
    }
  }
`
