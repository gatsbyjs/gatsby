// Returns the options that will be used to initialize the
// node-rss instance. Each feed may provide its own
// `setup` function, but by default we just return the siteMetadata
// merged with the other top-level keys in the result the feed's query
// (but excluding the `entries` key).
export default function setup({
  site: { siteMetadata },
  entries,
  ...rest
}) {
  return {
    ...siteMetadata,
    ...rest,
  }
}
