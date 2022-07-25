import React from "react"
import PropTypes from "prop-types"
import { graphql, useStaticQuery } from "gatsby"

function Seo({ children, description, lang, keywords }) {
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
  const { title } = data.site.siteMetadata

  return (
    <>
      <title>{title}</title>
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

Seo.defaultProps = {
  lang: `en`,
  keywords: [],
}

Seo.propTypes = {
  description: PropTypes.string,
  lang: PropTypes.string,
  keywords: PropTypes.arrayOf(PropTypes.string),
}

export default Seo
