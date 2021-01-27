import React from "react"
import { Helmet } from "react-helmet-async"
import { useLocation } from "@reach/router"

export const Head = props => {
  const location = useLocation()

  // This supports passing a gatsby-plugin-image object to the image prop, e.g.
  // image={getImage(data.metaImage)}
  const imageSrc = props.image?.images?.fallback?.src || props.image
  const imageWidth = props.image?.width
  const imageHeight = props.image?.height

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

      {imageSrc && (
        <>
          <meta name="image" content={imageSrc} />
          <meta name="twitter:image" content={imageSrc} />
          <meta property="og:image" content={imageSrc} />
          <meta name="twitter:card" content="summary_large_image" />
          {imageWidth && (
            <meta property="og:image:width" content={imageWidth} />
          )}
          {imageHeight && (
            <meta property="og:image:height" content={imageHeight} />
          )}
        </>
      )}

      {/* props.children must be at the end so users can override everything */}
      {props.children}
    </Helmet>
  )
}
