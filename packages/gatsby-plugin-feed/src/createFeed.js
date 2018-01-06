import url from 'url'
import RSS from 'rss'

const defaultOptions = {
  generator: `Gatsby`,
  title: `RSS Feed`,
}

export default function createFeed({
  metadata,
  entries,
  output,
}) {
  // Provide a couple of defaults that will
  // override the node-rss defaults
  const options = { ...defaultOptions }

  // Assign the default feed options. Note that we can skip existence
  // checks here because node-rss ignores undefined key values.
  options.author = metadata.author
  options.title = metadata.title
  options.description = metadata.description

  // Derive site_url and feed_url from the Gatsby site's siteUrl value
  if (metadata.siteUrl) {
    options.site_url = metadata.siteUrl
    options.feed_url = url.resolve(metadata.siteUrl, output)
  }

  // @TODO: generate custom namespaces and elements for media objects
  // specified in YAML frontmatter.
  if (hasMedia(entries)) {
    options.custom_namespaces = {
      itunes: `https://www.itunes.com/dtds/podcast-1.0.dtd`,
    }

    options.custom_elements = {

    }
  }

  // Return an instance of node-rss with our options
  return new RSS(options)
}

function hasMedia(nodes) {
  const node = (Array.isArray(nodes) ? nodes : [nodes])[0]
  const hasMedia = node && node.frontmatter && node.frontmatter.media

  return hasMedia
}
