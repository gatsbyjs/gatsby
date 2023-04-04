import React from "react"
import { graphql, useStaticQuery } from "gatsby"

function Seo({ children, description, lang = `en`, keywords = [], title = `` }) {
  const data = useStaticQuery(graphql`
    query DefaultSEOQuery {
      site {
        siteMetadata {
          title
          description
          social {
            twitter
          }
        }
      }
    }
  `)

  const metaDescription = description || data.site.siteMetadata.description

  return (
    <>
      <title>
        {title ? `${title} | ${data.site.siteMetadata.title}` : title}
      </title>
      <html lang={lang} />
      <meta name="description" content={metaDescription} />
      <meta name="og:title" content={title} />
      <meta name="og:description" content={metaDescription} />
      <meta name="twitter:card" content="summary" />
      <meta
        name="twitter:creator"
        content={data.site.siteMetadata.social.twitter}
      />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="og:type" content="website" />
      <meta name="keywords" content={keywords && keywords.join(",")} />
      {children}
    </>
  )
}

export default Seo
