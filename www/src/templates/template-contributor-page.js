import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

import Layout from "../components/layout"
import Container from "../components/container"
import BlogPostPreviewItem from "../components/blog-post-preview-item"
import { rhythm, options } from "../utils/typography"
import { space, radii } from "../utils/presets"

class ContributorPageTemplate extends React.Component {
  render() {
    const contributor = this.props.data.authorYaml
    const allMarkdownRemark = this.props.data.allMarkdownRemark
    return (
      <Layout location={this.props.location}>
        <Container>
          <div
            css={{
              textAlign: `center`,
              padding: `${rhythm(space[7])} ${rhythm(space[6])}`,
            }}
          >
            <div>
              <Img
                fixed={contributor.avatar.childImageSharp.fixed}
                css={{
                  height: rhythm(2.3),
                  width: rhythm(2.3),
                  borderRadius: radii[6],
                  display: `inline-block`,
                  verticalAlign: `middle`,
                }}
              />
              <h1
                css={{
                  marginTop: 0,
                }}
              >
                {contributor.id}
              </h1>
              <p
                css={{
                  fontFamily: options.headerFontFamily.join(`,`),
                  maxWidth: rhythm(18),
                  marginLeft: `auto`,
                  marginRight: `auto`,
                }}
              >
                {contributor.bio}
              </p>
              <a href={`https://twitter.com/${contributor.twitter}`}>
                {` `}
                {contributor.twitter}
              </a>
            </div>
          </div>
          <div css={{ padding: `${rhythm(space[7])} ${rhythm(space[6])}` }}>
            {allMarkdownRemark.edges.map(({ node }) => {
              if (node.frontmatter.author) {
                if (node.frontmatter.author.id === contributor.id) {
                  return (
                    <BlogPostPreviewItem
                      post={node}
                      key={node.fields.slug}
                      css={{ marginBottom: rhythm(space[9]) }}
                    />
                  )
                }
              }
              return null
            })}
          </div>
        </Container>
      </Layout>
    )
  }
}

export default ContributorPageTemplate

export const pageQuery = graphql`
  query($slug: String!) {
    authorYaml(fields: { slug: { eq: $slug } }) {
      id
      bio
      twitter
      avatar {
        childImageSharp {
          fixed(
            width: 63
            height: 63
            quality: 75
            traceSVG: { turdSize: 10, background: "#f6f2f8", color: "#e0d6eb" }
          ) {
            ...GatsbyImageSharpFixed_tracedSVG
          }
        }
      }
      fields {
        slug
      }
    }
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date, fields___slug] }
      filter: {
        fields: { released: { eq: true } }
        fileAbsolutePath: { regex: "/blog/" }
        frontmatter: { draft: { ne: true } }
      }
    ) {
      edges {
        node {
          ...BlogPostPreview_item
        }
      }
    }
  }
`
