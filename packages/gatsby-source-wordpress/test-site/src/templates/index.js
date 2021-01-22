import React from "react"
import { graphql, Link, navigate } from "gatsby"
import Img from "gatsby-image"
import ReactPaginate from "react-paginate"

import { Stack, Box, Heading, Text, Grid, Button } from "@chakra-ui/core"

import Layout from "../components/layout"
import { normalizePath } from "../utils/get-url-path"

export default ({ data, pageContext }) => (
  <Layout>
    <Stack spacing={5}>
      {data.allWpPost.nodes.map((page) => (
        <Box key={page.link}>
          <Link to={normalizePath(page.uri)}>
            <Box p={5} shadow="md" borderWidth="1px">
              <Grid templateColumns="1fr 2fr" gap={6}>
                <Box>
                  {!!page.featuredImage &&
                    !!page.featuredImage.localFile &&
                    !!page.featuredImage.localFile.childImageSharp && (
                      <Img
                        fluid={
                          page.featuredImage.localFile.childImageSharp.fluid
                        }
                      />
                    )}
                </Box>
                <Box>
                  <Heading as="h2" size="md">
                    {page.title}
                  </Heading>
                  {!!page.author && !!page.author.name && (
                    <Heading as="h3" size="sm">
                      Author: {page.author.name}
                    </Heading>
                  )}

                  <Box>
                    <Text dangerouslySetInnerHTML={{ __html: page.excerpt }} />
                  </Box>
                </Box>
              </Grid>
            </Box>
          </Link>
        </Box>
      ))}
    </Stack>

    {pageContext && pageContext.totalPages > 3 && (
      <Box mt={10}>
        <ReactPaginate
          previousLabel={
            pageContext &&
            pageContext.page !== 1 && (
              <Button>
                <Link to={`/blog/${pageContext.page - 1}`}>Previous page</Link>
              </Button>
            )
          }
          nextLabel={
            pageContext &&
            pageContext.totalPages !== pageContext.page && (
              <Button>
                <Link to={`/blog/${pageContext.page + 1}`}>Next page</Link>
              </Button>
            )
          }
          onPageChange={({ selected }) => {
            const page = selected + 1
            const path = page === 1 ? `/blog` : `/blog/${page}`
            navigate(path)
          }}
          breakLabel={`...`}
          breakClassName={`break-me`}
          pageCount={pageContext.totalPages}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          containerClassName={`pagination`}
          subContainerClassName={`pages pagination`}
          activeClassName={`active`}
        />
      </Box>
    )}
  </Layout>
)

export const query = graphql`
  fragment Thumbnail on File {
    childImageSharp {
      fluid(maxWidth: 500) {
        ...GatsbyImageSharpFluid_tracedSVG
      }
    }
  }

  query HomePage($offset: Int!, $perPage: Int!) {
    allWpPost(
      limit: $perPage
      skip: $offset
      filter: { nodeType: { in: ["Post", "Page", "Alot"] } }
      sort: { fields: date, order: DESC }
    ) {
      nodes {
        uri
        title
        featuredImage {
          node {
            localFile {
              ...Thumbnail
            }
          }
        }
      }
    }
  }
`
