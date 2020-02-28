/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import Helmet from "react-helmet"

export default function PageMetadata({
  children,
  title,
  description,
  timeToRead,
  image,
  type = "article",
}) {
  return (
    <Helmet>
      {title && (
        <>
          <title>{title}</title>
          <meta property="og:title" content={title} />
        </>
      )}
      {description && (
        <>
          <meta name="description" content={description} />
          <meta name="og:description" content={description} />
        </>
      )}
      <meta name="og:type" content={type} />
      {timeToRead && (
        <>
          <meta name="twitter.label1" content="Reading time" />
          <meta name="twitter:data1" content={`${timeToRead} min read`} />
        </>
      )}
      {image && (
        <>
          <meta name="og:image" content={image.src} />
          {image.width && <meta name="og:image:width" content={image.width} />}
          {image.height && (
            <meta name="og:image:width" content={image.height} />
          )}
        </>
      )}
      {children}
    </Helmet>
  )
}
