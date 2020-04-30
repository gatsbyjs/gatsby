/** @jsx jsx */
import { jsx } from "theme-ui"
import { Helmet } from "react-helmet"
import useSiteMetadata from "../hooks/use-site-metadata"

/**
 * Component representing common metadata of a page.
 *
 * Different crawlers such as Twitter Cards and Facebook's Open Graph Protocol (OGP)
 * use different meta tags to annotate web pages for things like smart previews.
 * This component abstracts out the specific meta tags and attributes necessary and defines
 * valid properties that can be attached to metadata for Gatsby site pages.
 *
 * Props:
 *
 * @param title The title of the page used in the `<title>` tag.
 * @param description A longer description of the page, used in the "description" tag
 * as well as OGP.
 *
 * @param type The type of the page, used by OGP: https://ogp.me/#types
 *
 * @param image An image to be attached to the Facebook preview and Twitter Card. Consists of:
 *
 *  - `src` the source the image
 *  - `width` the width of the image
 *  - `height` the height of the image
 *
 * @param twitterCard The Twitter card type, which will be one of
 * “summary”, “summary_large_image”, “app”, or “player”.
 *
 * @param timeToRead The amount of time it takes to read the article, in minutes.
 * Used by Slack rich previews:
 * https://api.slack.com/legacy/message-link-unfurling#classic_unfurling
 *
 * @param children You can specify additional meta properties or override them by
 * adding children to this component. For example:
 *
 * ```
 * <PageMetadata>
 *   <meta name="author" content={author.id} />
 * </PageMetadata>
 * ```
 *
 * Additional References:
 *
 *  - Open Graph Protocol: https://ogp.me/
 *  - Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
 *  - Twitter Card Docs: https://developer.twitter.com/en/docs/tweets/optimize-with-cards/overview/markup
 *  - Twitter Card validator: https://cards-dev.twitter.com/validator
 */
export default function PageMetadata({
  title,
  description,
  type,
  image,
  twitterCard,
  timeToRead,
  children,
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
      {twitterCard && <meta name="twitter:card" content={twitterCard} />}
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
