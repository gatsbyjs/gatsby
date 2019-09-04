import React from "react"
import { Helmet } from "react-helmet"
import { graphql } from "gatsby"
import Img from "gatsby-image"

import Layout from "../components/layout"
import Container from "../components/container"
import BlogPostPreviewItem from "../components/blog-post-preview-item"
import { rhythm } from "../utils/typography"
import { space, radii, fonts } from "../utils/presets"
import FooterLinks from "../components/shared/footer-links"

class ContributorPageTemplate extends React.Component {
  render() {
    const contributor = this.props.data.authorYaml

    const posts = this.props.data.allMdx.nodes.filter(
      post =>
        post.frontmatter.author && post.frontmatter.author.id === contributor.id
    )

    return (
      <Layout location={this.props.location}>
        <Helmet>
          <title>{`${contributor.id} - Contributor`}</title>
          <meta name="description" content={contributor.bio} />
          <meta property="og:description" content={contributor.bio} />
          <meta name="twitter:description" content={contributor.bio} />
          <meta property="og:title" content={contributor.id} />
          {contributor.avatar && (
            <meta
              property="og:image"
              content={`https://gatsbyjs.org${contributor.avatar.childImageSharp.fixed.src}`}
            />
          )}
          {contributor.avatar && (
            <meta
              name="twitter:image"
              content={`https://gatsbyjs.org${contributor.avatar.childImageSharp.fixed.src}`}
            />
          )}
        </Helmet>
        <main>
          <Container>
            <div
              css={{
                textAlign: `center`,
                padding: `${space[7]} ${space[6]}`,
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
                    fontFamily: fonts.header,
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
            <div css={{ padding: `${space[7]} ${space[6]}` }}>
              {posts.map(node => (
                <BlogPostPreviewItem
                  post={node}
                  key={node.fields.slug}
                  css={{ marginBottom: space[9] }}
                />
              ))}
            </div>
          </Container>
          <FooterLinks />
        </main>
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
