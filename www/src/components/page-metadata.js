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
  // <Helmet> doesn't support JSX fragments so we can't bundle the tags based on
  // the property they match up with
  return (
    <Helmet>
      {title && <title>{title}</title>}
      {title && <meta property="og:title" content={title} />}
      {description && <meta name="description" content={description} />}
      {description && <meta name="og:description" content={description} />}
      <meta name="og:type" content={type} />
      {/* Used by slack to display rich previews */}
      {timeToRead && <meta name="twitter.label1" content="Reading time" />}
      {timeToRead && (
        <meta name="twitter:data1" content={`${timeToRead} min read`} />
      )}
      {image && (
        <meta name="og:image" content={`https://gatsbyjs.org${image.src}`} />
      )}
      {image?.width && <meta name="og:image:width" content={image.width} />}
      {image?.height && <meta name="og:image:width" content={image.height} />}
      {children}
    </Helmet>
  )
}
