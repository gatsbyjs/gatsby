import React from "react"
import PageMetadata from "./page-metadata"

/**
 * Extend page metadata with additional information about article authorship.
 *
 * More information:
 *  - https://ogp.me/#type_article
 *  - https://developer.twitter.com/en/docs/tweets/optimize-with-cards/overview/markup
 */
export default function BlogPostMetadata({ post }) {
  const { canonicalLink, title, image, author, rawDate } = post.frontmatter
  return (
    <PageMetadata
      title={title}
      description={post.fields.excerpt}
      type="article"
      timeToRead={post.timeToRead}
      image={image?.childImageSharp.resize}
    >
      {/* These are populated when the article is published elsewhere and has a
      canonical link to that location */}
      {canonicalLink && <link rel="canonical" href={canonicalLink} />}
      {canonicalLink && <meta property="og:url" content={canonicalLink} />}
      <link rel="author" href={`https://gatsbyjs.org${author.fields.slug}`} />
      <meta name="author" content={author.id} />
      <meta name="twitter:creator" content={author.twitter} />
      <meta property="article:author" content={author.id} />
      <meta property="article:published_time" content={rawDate} />
    </PageMetadata>
  )
}
