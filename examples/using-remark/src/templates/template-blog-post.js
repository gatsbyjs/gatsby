import React from "react"
import Link from "gatsby-link"
import styles from "../styles"
import { rhythm, scale } from "../utils/typography"
import presets from "../utils/presets"

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
            <Link to={tag}>
              {post.frontmatter.tags[i]}
            </Link>
            {divider}
          </span>
        )
      })
      tagsSection = (
        <small
          css={{
            ...scale(-1 / 5),
            fontStyle: `normal`,
            textAlign: `left`,
          }}
        >
          tagged {tags}
        </small>
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
              ...scale(-3 / 10),
              display: `block`,
              color: `${styles.colors.light}`,
              [presets.Hd]: {
                ...scale(-2 / 5),
              },
            }}
          >
            {post.timeToRead} min read &middot; {tagsSection}

          </p>
        </header>
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
        <p>@todo Link to next/previous article(s)</p>
      </div>
    )
  }
}

export default BlogPostRoute

export const pageQuery = graphql`
query BlogPostBySlug($slug: String!) {
  markdownRemark(fields: { slug: { eq: $slug }}) {
    html
    timeToRead
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
              responsiveResolution(width: 50, height: 50, quality: 75, grayscale:true) {
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
