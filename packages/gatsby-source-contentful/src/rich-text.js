import { documentToReactComponents } from "@contentful/rich-text-react-renderer"

function renderRichText({ json, links }, makeOptions = {}) {
  const options =
    typeof makeOptions === `function`
      ? makeOptions(generateLinkMaps(links))
      : makeOptions

  return documentToReactComponents(json, options)
}

exports.renderRichText = renderRichText

/**
 * Helper function to simplify Rich Text rendering. Based on:
 * https://www.contentful.com/blog/2021/04/14/rendering-linked-assets-entries-in-contentful/
 */
function generateLinkMaps(links) {
  const assetBlockMap = new Map()
  for (const asset of links?.assets.block || []) {
    assetBlockMap.set(asset.sys.id, asset)
  }

  const assetHyperlinkMap = new Map()
  for (const asset of links?.assets.hyperlink || []) {
    assetHyperlinkMap.set(asset.sys.id, asset)
  }

  const entryBlockMap = new Map()
  for (const entry of links?.entries.block || []) {
    entryBlockMap.set(entry.sys.id, entry)
  }

  const entryInlineMap = new Map()
  for (const entry of links?.entries.inline || []) {
    entryInlineMap.set(entry.sys.id, entry)
  }

  const entryHyperlinkMap = new Map()
  for (const entry of links?.entries.hyperlink || []) {
    entryHyperlinkMap.set(entry.sys.id, entry)
  }

  return {
    assetBlockMap,
    assetHyperlinkMap,
    entryBlockMap,
    entryInlineMap,
    entryHyperlinkMap,
  }
}
