import React from "react"
import { Helmet } from "react-helmet"
import { graphql, useStaticQuery } from "gatsby"

import gatsbyIcon from "../assets/gatsby-icon.png"

const SiteMetadata = props => {
  const {
    site: {
      siteMetadata: { siteUrl, title, twitter },
    },
  } = useStaticQuery(graphql`
    query SiteMetadata {
      site {
        siteMetadata {
          siteUrl
          title
          twitter
        }
      }
    }
  `)

  const {
    metaImage = `${siteUrl}${gatsbyIcon}`,
    metaTitle = title,
    metaDescription = `${siteUrl}`,
  } = props

  const generateMetaTags = (type, content) => (
    <Helmet>
      <meta property={`og:${type}`} content={content} />
      <meta name={`twitter:${type}`} content={content} />
    </Helmet>
  )

  return (
    <React.Fragment>
      <Helmet>
        <html lang="en" />
        <link rel="canonical" href={`${siteUrl}${props.pathname}`} />
        <meta name="docsearch:version" content="2.0" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,shrink-to-fit=no,viewport-fit=cover"
        />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en" />
        <meta property="og:site_name" content={metaTitle} />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={twitter} />
      </Helmet>
      {generateMetaTags(`description`, metaDescription)}
      {generateMetaTags(`image`, metaImage)}
      {generateMetaTags(`title`, metaTitle)}
    </React.Fragment>
  )
}

export default SiteMetadata
