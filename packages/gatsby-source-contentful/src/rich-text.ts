import {
  documentToReactComponents,
  Options,
} from "@contentful/rich-text-react-renderer"
import {
  AssetHyperlink,
  AssetLinkBlock,
  Document,
  EntryHyperlink,
  EntryLinkBlock,
  EntryLinkInline,
} from "@contentful/rich-text-types"
import React from "react"
import type { IContentfulEntry, IContentfulAsset } from "./types/contentful"

interface IContentfulRichTextLinksAssets {
  block: Array<IContentfulAsset>
  hyperlink: Array<IContentfulAsset>
}

interface IContentfulRichTextLinksEntries {
  inline: Array<IContentfulEntry>
  block: Array<IContentfulEntry>
  hyperlink: Array<IContentfulEntry>
}

interface IContentfulRichTextLinks {
  assets: IContentfulRichTextLinksAssets
  entries: IContentfulRichTextLinksEntries
}

type AssetBlockMap = Map<string, AssetLinkBlock>
type AssetHyperlinkMap = Map<string, AssetHyperlink>
type EntryBlockMap = Map<string, EntryLinkBlock>
type EntryInlineMap = Map<string, EntryLinkInline>
type EntryHyperlinkMap = Map<string, EntryHyperlink>
interface IMakeOptions {
  assetBlockMap: AssetBlockMap
  assetHyperlinkMap: AssetHyperlinkMap
  entryBlockMap: EntryBlockMap
  entryInlineMap: EntryInlineMap
  entryHyperlinkMap: EntryHyperlinkMap
}
export type MakeOptions = (referenceMaps: IMakeOptions) => Options

export function renderRichText(
  {
    json,
    links,
  }: {
    json: Document
    links: IContentfulRichTextLinks
  },
  makeOptions: MakeOptions | Options
): React.ReactNode {
  const options =
    typeof makeOptions === `function`
      ? makeOptions(generateLinkMaps(links))
      : makeOptions

  return documentToReactComponents(json, options)
}

/**
 * Helper function to simplify Rich Text rendering. Based on:
 * https://www.contentful.com/blog/2021/04/14/rendering-linked-assets-entries-in-contentful/
 */
function generateLinkMaps(links): {
  assetBlockMap: AssetBlockMap
  assetHyperlinkMap: AssetHyperlinkMap
  entryBlockMap: EntryBlockMap
  entryInlineMap: EntryInlineMap
  entryHyperlinkMap: EntryHyperlinkMap
} {
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
