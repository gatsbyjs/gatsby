import React from "react"
import { Helmet } from "react-helmet"
import useSiteMetadata from "../hooks/use-site-metadata"

import { useLocale } from "./I18nContext"
import gatsbyIcon from "../assets/gatsby-icon.png"

const SiteMetadata = ({ pathname }) => {
  const { siteUrl, title, twitter } = useSiteMetadata()

  const locale = useLocale()
  // Note: `location.href` isn't available on server-side so we must get it from `pathname`:
  // https://css-tricks.com/how-to-the-get-current-page-url-in-gatsby/#article-header-id-4
  const href = `${siteUrl}${pathname}`

  return (
    <Helmet defer={false} defaultTitle={title} titleTemplate={`%s | ${title}`}>
      <html lang={locale} />
      <link rel="canonical" href={href} />
      <meta name="docsearch:version" content="2.0" />
      <meta
        name="viewport"
        content="width=device-width,initial-scale=1,shrink-to-fit=no,viewport-fit=cover"
      />

      <meta property="og:url" content={href} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content={title} />
      <meta property="og:image" content={`${siteUrl}${gatsbyIcon}`} />
      <meta property="og:image:alt" content="Gatsby Logo" />
      <meta property="og:image:width" content="512" />
      <meta property="og:image:height" content="512" />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content={twitter} />
    </Helmet>
  )
}

export default SiteMetadata
