/** @jsx jsx */
import { jsx } from "theme-ui"
import Helmet from "react-helmet"
import useSiteMetadata from "../hooks/use-site-metadata"

export default function PageMetadata({
  children,
  title,
  description,
  timeToRead,
  image,
  type,
}) {
  const { siteUrl } = useSiteMetadata()
  // <Helmet> doesn't support JSX fragments so we can't bundle the tags based on
  // the property they match up with
  return (
    <Helmet>
      {title && <title>{title}</title>}
      {title && <meta property="og:title" content={title} />}
      {description && <meta name="description" content={description} />}
      {description && <meta property="og:description" content={description} />}
      {type && <meta property="og:type" content={type} />}
      {/* Used by slack to display rich previews */}
      {timeToRead && <meta name="twitter:label1" content="Reading time" />}
      {timeToRead && (
        <meta name="twitter:data1" content={`${timeToRead} min read`} />
      )}
      {image && <meta property="og:image" content={`${siteUrl}${image.src}`} />}
      {image?.width && <meta property="og:image:width" content={image.width} />}
      {image?.height && (
        <meta property="og:image:height" content={image.height} />
      )}
      {children}
    </Helmet>
  )
}
