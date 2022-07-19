import React from "react"
import PropTypes from "prop-types"
import { graphql, useStaticQuery } from "gatsby"

function SEO({ description, lang, meta, keywords, title }) {
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
        {title} | {data.site.siteMetadata.title}
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
    </>
  )
}

SEO.defaultProps = {
  lang: `en`,
  meta: [],
  keywords: [],
}

SEO.propTypes = {
  description: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.array,
  keywords: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string.isRequired,
}

export default SEO
