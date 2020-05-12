/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { graphql } from "gatsby"

import Avatar from "../components/avatar"
import Container from "../components/container"
import BlogPostPreviewItem from "../components/blog-post-preview-item"
import FooterLinks from "../components/shared/footer-links"
import PageMetadata from "../components/page-metadata"

class ContributorPageTemplate extends React.Component {
  render() {
    const contributor = this.props.data.authorYaml

    const posts = this.props.data.allMdx.nodes.filter(
      post =>
        post.frontmatter.author && post.frontmatter.author.id === contributor.id
    )

    return (
      <main>
        <PageMetadata
          title={`${contributor.id} - Contributor`}
          description={contributor.bio}
          image={contributor.avatar?.childImageSharp.fixed}
        />
        <Container>
          <div
            sx={{
              textAlign: `center`,
              py: 7,
              px: 6,
            }}
          >
            <div>
              <Avatar image={contributor.avatar.childImageSharp.fixed} />
              <h1 sx={{ mt: 0, mb: 3 }}>{contributor.id}</h1>
              <p
                sx={{
                  fontFamily: `heading`,
                  fontSize: 3,
                  maxWidth: `28rem`,
                  mx: `auto`,
                }}
              >
                {contributor.bio}
              </p>
              {contributor.twitter && (
                <a href={`https://twitter.com/${contributor.twitter}`}>
                  {` `}
                  {contributor.twitter}
                </a>
              )}
            </div>
          </div>
          <div sx={{ py: 7, px: 6 }}>
            {posts.map(node => (
              <BlogPostPreviewItem
                post={node}
                key={node.fields.slug}
                sx={{ mb: 9 }}
              />
            ))}
          </div>
        </Container>
        <FooterLinks />
      </main>
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
            width: 64
            height: 64
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
    allMdx(
      sort: { order: DESC, fields: [frontmatter___date, fields___slug] }
      filter: {
        fields: { released: { eq: true } }
        fileAbsolutePath: { regex: "/blog/" }
        frontmatter: { draft: { ne: true } }
      }
    ) {
      nodes {
        ...BlogPostPreview_item
      }
    }
  }
`
