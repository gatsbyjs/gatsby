import React from "react"
import Helmet from "react-helmet"
import { graphql, StaticQuery } from "gatsby"

import gatsbyIcon from "../assets/gatsby-icon.png"

const SiteMetadata = ({ pathname }) => (
  <StaticQuery
    query={graphql`
      query SiteMetadata {
        site {
          siteMetadata {
            siteUrl
            title
            description
          }
        }
      }
    `}
    render={({
      site: {
        siteMetadata: { siteUrl, title, description },
      },
    }) => (
      <Helmet defaultTitle={title} titleTemplate={`%s · ${title}`}>
        <html lang="en" />
        <link rel="canonical" href={`${siteUrl}${pathname}`} />
        <meta name="docsearch:version" content="2.0" />

        <meta property="og:url" content={siteUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en" />
        <meta property="og:title" content={title} />
        <meta property="og:site_name" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={`${siteUrl}${gatsbyIcon}`} />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@gatsbyjs" />
      </Helmet>
    )}
  />
)

export default SiteMetadata
