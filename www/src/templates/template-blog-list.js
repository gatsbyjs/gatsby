import React from "react"
import { graphql } from "gatsby"
import { Helmet } from "react-helmet"
import TagsIcon from "react-icons/lib/ti/tags"

import Layout from "../components/layout"
import Button from "../components/button"
import Container from "../components/container"
import BlogPostPreviewItem from "../components/blog-post-preview-item"
import Pagination from "../components/pagination"
import EmailCaptureForm from "../components/email-capture-form"
import FooterLinks from "../components/shared/footer-links"

import {
  colors,
  space,
  transition,
  radii,
  shadows,
  mediaQueries,
} from "../utils/presets"
import { pullIntoGutter, breakpointGutter } from "../utils/styles"

class BlogPostsIndex extends React.Component {
  render() {
    const { allMdx } = this.props.data

    return (
      <Layout location={this.props.location}>
        <main
          id={`reach-skip-nav`}
          css={{ [breakpointGutter]: { background: colors.ui.background } }}
        >
          <Helmet>
            <title>{`Blog | Page ${this.props.pageContext.currentPage}`}</title>
          </Helmet>
          <Container>
            <div
              css={{
                ...pullIntoGutter,
                display: `flex`,
                justifyContent: `space-between`,
                borderBottom: `1px solid ${colors.ui.border.subtle}`,
                marginBottom: `${space[6]}`,
                paddingBottom: `${space[6]}`,
                [breakpointGutter]: {
                  paddingBottom: 0,
                  border: 0,
                },
              }}
            >
              <h1 css={{ marginBottom: 0 }}>Blog</h1>
              <Button key="blog-view-all-tags-button" to="/blog/tags" small>
                View all Tags <TagsIcon />
              </Button>
            </div>
            {allMdx.edges.map(({ node }, index) => (
              <BlogPostPreviewItem
                post={node}
                key={node.fields.slug}
                css={{
                  borderBottom: `1px solid ${colors.ui.border.subtle}`,
                  paddingBottom: space[8],
                  marginBottom:
                    index === allMdx.edges.length - 1 ? 0 : space[8],
                  ...pullIntoGutter,
                  [breakpointGutter]: {
                    padding: space[9],
                    boxShadow: shadows.raised,
                    background: colors.white,
                    borderRadius: radii[2],
                    border: 0,
                    marginBottom: space[6],
                    marginLeft: 0,
                    marginRight: 0,
                    transition: `transform ${transition.speed.default} ${
                      transition.curve.default
                    },  box-shadow ${transition.speed.default} ${
                      transition.curve.default
                    }, padding ${transition.speed.default} ${
                      transition.curve.default
                    }`,
                    "&:hover": {
                      transform: `translateY(-${space[1]})`,
                      boxShadow: shadows.overlay,
                    },
                    "&:active": {
                      boxShadow: shadows.cardActive,
                      transform: `translateY(0)`,
                    },
                  },
                  [mediaQueries.md]: {
                    marginLeft: `-${space[9]}`,
                    marginRight: `-${space[9]}`,
                  },
                }}
              />
            ))}
            <Pagination context={this.props.pageContext} />
            <EmailCaptureForm signupMessage="Enjoying our blog? Receive the next post in your inbox!" />
          </Container>
          <FooterLinks />
        </main>
      </Layout>
    )
  }
}

export default BlogPostsIndex

export const pageQuery = graphql`
  query blogListQuery($skip: Int!, $limit: Int!) {
    allMdx(
      sort: { order: DESC, fields: [frontmatter___date, fields___slug] }
      filter: {
        frontmatter: { draft: { ne: true } }
        fileAbsolutePath: { regex: "/docs.blog/" }
        fields: { released: { eq: true } }
      }
      limit: $limit
      skip: $skip
    ) {
      edges {
        node {
          ...BlogPostPreview_item
        }
      }
    }
  }
`
