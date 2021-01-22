import React from "react"

import { Link } from "gatsby"
import { Box, Heading } from "@chakra-ui/core"
import Img from "gatsby-image"
import Layout from "../../components/layout"
import { normalizePath } from "../../utils/get-url-path"

function BlogPost({ data }) {
  const { nextPage, previousPage, page } = data
  const { title, content, featuredImage } = page

  return (
    <Layout>
      <Heading as="h1" size="xl" mb={5}>
        {title}
      </Heading>

      {!!featuredImage?.node?.localFile?.childImageSharp && (
        <Box mb={5}>
          <Img fluid={featuredImage.node.localFile.childImageSharp.fluid} />
        </Box>
      )}

      <p dangerouslySetInnerHTML={{ __html: content }} />

      <br />
      {!!nextPage && (
        <Link to={normalizePath(nextPage.uri)}>Next: {nextPage.title}</Link>
      )}
      <br />
      {!!previousPage && (
        <Link to={normalizePath(previousPage.uri)}>
          Previous: {previousPage.title}
        </Link>
      )}
    </Layout>
  )
}

export default BlogPost
