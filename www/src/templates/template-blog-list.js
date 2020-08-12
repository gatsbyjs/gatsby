/** @jsx jsx */
import { jsx } from "theme-ui"
import { graphql } from "gatsby"
import { TiTags as TagsIcon } from "react-icons/ti"

import Button from "../components/button"
import Container from "../components/container"
import BlogPostPreviewItem from "../components/blog-post-preview-item"
import Pagination from "../components/pagination"
import EmailCaptureForm from "../components/email-capture-form"
import FooterLinks from "../components/shared/footer-links"
import PageMetadata from "../components/page-metadata"

import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"
import { pullIntoGutter, breakpointGutter } from "../utils/styles"

export default function BlogPostsIndex({ data, pageContext }) {
  const posts = data.allMdx.nodes
  return (
    <main id={`reach-skip-nav`}>
      <PageMetadata title={`Blog | Page ${pageContext.currentPage}`} />
      <Container>
        <div
          sx={{
            ...pullIntoGutter,
            display: `flex`,
            justifyContent: `space-between`,
            borderBottom: 1,
            borderColor: `ui.border`,
            mb: 6,
            pb: 6,
            [breakpointGutter]: {
              pb: 0,
              border: 0,
            },
          }}
        >
          <h1 sx={{ mb: 0 }}>Blog</h1>
          <Button
            key="blog-view-all-tags-button"
            to="/blog/tags"
            variant="small"
          >
            View all Tags <TagsIcon />
          </Button>
        </div>
        {posts.map((node, index) => (
          <BlogPostPreviewItem
            post={node}
            key={node.fields.slug}
            sx={{
              borderBottom: 1,
              borderColor: `ui.border`,
              pb: 8,
              mb: index === posts.length - 1 ? 0 : 8,
              ...pullIntoGutter,
              [breakpointGutter]: {
                p: 9,
                boxShadow: `raised`,
                bg: `card.background`,
                borderRadius: 2,
                border: 0,
                mb: 6,
                mx: 0,
                transition: t =>
                  `transform ${t.transition.default},  box-shadow ${t.transition.default}, padding ${t.transition.default}`,
                "&:hover": {
                  transform: t => `translateY(-${t.space[1]})`,
                  boxShadow: `overlay`,
                },
                "&:active": {
                  boxShadow: `cardActive`,
                  transform: `translateY(0)`,
                },
              },
              [mediaQueries.md]: {
                mx: -9,
              },
            }}
          />
        ))}
        <Pagination context={pageContext} />
        <EmailCaptureForm signupMessage="Enjoying our blog? Receive the next post in your inbox!" />
      </Container>
      <FooterLinks />
    </main>
  )
}

export const pageQuery = graphql`
  query blogListQuery($skip: Int!, $limit: Int!) {
    allMdx(
      sort: { order: DESC, fields: [frontmatter___date, fields___slug] }
      filter: { fields: { section: { eq: "blog" }, released: { eq: true } } }
      limit: $limit
      skip: $skip
    ) {
      nodes {
        ...BlogPostPreview_item
      }
    }
  }
`
