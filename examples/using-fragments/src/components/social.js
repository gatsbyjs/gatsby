import React from "react"
import { graphql } from "gatsby"

const Social = ({ data }) => <div>{data.site.siteMetadata.social.twitter}</div>

export default Social

export const socialFragment = graphql`
  fragment SocialFragment on Site {
    siteMetadata {
      social {
        twitter
      }
    }
  }
`
