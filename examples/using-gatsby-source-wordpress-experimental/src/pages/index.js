import React from "react"
import { graphql, Link } from "gatsby"
import Img from "gatsby-image"
import urlToPath from "gatsby-source-wordpress/src/utils/url-to-path"

import { Stack, Box, Heading, Text, Grid } from "@chakra-ui/core"
import Layout from "../components/layout"

export default ({ data }) => {
  const pages = [
    ...data.allWpAlot.nodes,
    ...data.allWpPost.nodes,
    ...data.allWpPage.nodes,
  ]

  return (
    <Layout>
      <Stack spacing={5}>
        {pages.map(page => (
          <Box key={page.link}>
            <Link to={urlToPath(page.link)}>
              <Box p={5} shadow="md" borderWidth="1px">
                <Grid templateColumns="1fr 2fr" gap={6}>
                  <Box>
                    {!!page.featuredImage &&
                      !!page.featuredImage.remoteFile &&
                      !!page.featuredImage.remoteFile.childImageSharp && (
                        <Img
                          fluid={
                            page.featuredImage.remoteFile.childImageSharp.fluid
                          }
                        />
                      )}
                  </Box>
                  <Box>
                    <Heading as="h2" size="md">
                      {page.title}
                    </Heading>

                    <Box>
                      <Text
                        dangerouslySetInnerHTML={{ __html: page.excerpt }}
                      />
                    </Box>
                  </Box>
                </Grid>
              </Box>
            </Link>
          </Box>
        ))}
      </Stack>
    </Layout>
  )
}

export const query = graphql`
  fragment Thumbnail on File {
    childImageSharp {
      fluid(maxWidth: 500) {
        ...GatsbyImageSharpFluid_tracedSVG
      }
    }
  }

  query HomePage {
    allWpPage(limit: 10) {
      nodes {
        title
        link
        excerpt
        featuredImage {
          remoteFile {
            ...Thumbnail
          }
        }
      }
    }

    allWpPost(limit: 10) {
      nodes {
        title
        link
        excerpt
        featuredImage {
          remoteFile {
            ...Thumbnail
          }
        }
      }
    }

    allWpAlot(limit: 10) {
      nodes {
        title
        link
        excerpt
        featuredImage {
          remoteFile {
            ...Thumbnail
          }
        }
      }
    }
  }
`
