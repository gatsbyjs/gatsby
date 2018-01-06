export default function serialize({
  query: {
    site,
    entries,
  },
}) {
  return entries.edges.map(edge => {
    return {
      ...edge.node.frontmatter,
      description: edge.node.excerpt,
      url: site.siteMetadata.siteUrl + edge.node.fields.slug,
      guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
      custom_elements: [{ "content:encoded": edge.node.html }],
    }
  })
}
