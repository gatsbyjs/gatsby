import React from "react"
import { Helmet } from "react-helmet-async"
import { useLocation } from "@reach/router"

export const Head = props => {
  const location = useLocation()

  // This supports passing a gatsby-plugin-image object to the image prop, e.g.
  // image={getImage(data.metaImage)}
  const image = props.image?.images?.fallback?.src || props.image
  const { title, description } = props

  return (
    <Helmet>
      {/* General meta tags */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={location.href} />

      {title && (
        <>
          <title>{title}</title>
          <meta name="twitter:title" content={title} />
          <meta property="og:title" content={title} />
        </>
      )}

      {description && (
        <>
          <meta name="description" content={description} />
          <meta name="twitter:description" content={description} />
          <meta property="og:description" content={description} />
        </>
      )}

      {image && (
        <>
          <meta name="twitter:image" content={image} />
          <meta property="og:image" content={image} />
          <meta name="twitter:card" content="summary_large_image" />
        </>
      )}

      {/* props.children must be at the end so users can override everything */}
      {props.children}
    </Helmet>
  )
}
