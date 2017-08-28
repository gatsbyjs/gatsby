import React from "react"
import Link from "gatsby-link"
import styles from "../styles"
import { rhythm, scale } from "../utils/typography"
import presets from "../utils/presets"

require(`katex/dist/katex.min.css`)

class BlogPostRoute extends React.Component {
  render() {
    const post = this.props.data.markdownRemark

    let tags
    let tagsSection
    if (post.fields.tagSlugs) {
      const tagsArray = post.fields.tagSlugs
      tags = tagsArray.map((tag, i) => {
        const divider = i < tagsArray.length - 1 && <span>{`, `}</span>
        return (
          <span key={tag}>
            <Link to={tag}>{post.frontmatter.tags[i]}</Link>
            {divider}
          </span>
        )
      })
      tagsSection = (
        <span
          css={{
            fontStyle: `normal`,
            textAlign: `left`,
          }}
        >
          tagged {tags}
        </span>
      )
    }

    return (
      <div
        css={{
          maxWidth: rhythm(26),
        }}
      >
        <header>
          <h1
            css={{
              marginBottom: rhythm(1 / 6),
              color: post.frontmatter.shadow,
            }}
          >
            {post.frontmatter.title}
          </h1>
          <p
            css={{
              ...scale(-1 / 5),
              display: `block`,
              color: `${styles.colors.light}`,
            }}
          >
            {post.timeToRead} min read &middot; {tagsSection}
          </p>
        </header>

        <h2>Contents</h2>
        <div
          dangerouslySetInnerHTML={{ __html: post.tableOfContents }}
          className="toc"
        />

        <div dangerouslySetInnerHTML={{ __html: post.html }} className="post" />
        <hr
          css={{
            marginBottom: rhythm(1),
            marginTop: rhythm(2),
          }}
        />
        <p
          css={{
            marginBottom: rhythm(4 / 4),
            display: `flex`,
            alignItems: `center`,
          }}
        >
          <img
            alt={`Avatar of ${post.frontmatter.author.id}`}
            src={
              post.frontmatter.author.avatar.children[0].responsiveResolution
                .src
            }
            srcSet={
              post.frontmatter.author.avatar.children[0].responsiveResolution
                .srcSet
            }
            css={{
              borderRadius: `100%`,
              float: `left`,
              marginRight: rhythm(3 / 4),
              marginBottom: 0,
            }}
          />
          <span
            css={{
              color: styles.colors.light,
              ...scale(-1 / 5),
            }}
          >
            <small
              css={{
                fontWeight: `bold`,
                color: styles.colors.text,
                textTransform: `uppercase`,
              }}
            >
              {post.frontmatter.author.id}
            </small>
            {` `}
            {post.frontmatter.author.bio}
          </span>
        </p>
      </div>
    )
  }
}

export default BlogPostRoute

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      timeToRead
      tableOfContents
      fields {
        tagSlugs
      }
      frontmatter {
        title
        tags
        date(formatString: "MMMM DD, YYYY")
        author {
          id
          bio
          avatar {
            children {
              ... on ImageSharp {
                responsiveResolution(
                  width: 50
                  height: 50
                  quality: 75
                  grayscale: true
                ) {
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
