/**
 * Bio component that queries for data
 * with Gatsby's StaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/static-query/
 */

import React from "react"
import { StaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"
import { Flex, css } from "theme-ui"
import BioFragment from "../fragments/bio.mdx"

function Bio() {
  return (
    <StaticQuery
      query={bioQuery}
      render={data => {
        const { author } = data.site.siteMetadata
        return (
          <Flex mb={2}>
            <Image
              fixed={data.avatar.childImageSharp.fixed}
              alt={author}
              css={css({
                mr: 1,
                mb: 0,
                width: 48,
                borderRadius: 99999,
              })}
            />
            <BioFragment />
          </Flex>
        )
      }}
    />
  )
}

const bioQuery = graphql`
  query BioQuery {
    avatar: file(absolutePath: { regex: "/profile-pic.jpg/" }) {
      childImageSharp {
        fixed(width: 48, height: 48) {
          ...GatsbyImageSharpFixed
        }
      }
    }
    # bioFragment: mdx(fileAbsolutePath: { regex: "/content/fragments/bio/" }) {
    #   id
    #   code {
    #     body
    #   }
    # }
    site {
      siteMetadata {
        author
        social {
          twitter
        }
      }
    }
  }
`

export default Bio
