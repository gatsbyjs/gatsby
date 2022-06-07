import type { Plugin } from "unified"

import type { BlockContent, DefinitionContent, ListItem } from "mdast"
import type { IMdxVFile } from "./types"

type TocNodeType = BlockContent | DefinitionContent | ListItem

const remarkInferTocMeta: Plugin = (options = { maxDepth: 6 }) => {
  const { toc, visit, maxDepth } = options

  const processToC = (
    node: TocNodeType,
    current: Partial<TocNodeType>
  ): Partial<TocNodeType> => {
    if (!node) {
      return {}
    } else if (node.type === `paragraph`) {
      visit(node, item => {
        if (item.type === `link`) {
          current.url = item.url
        }
        if (item.type === `text`) {
          current.title = item.value
        }
      })
      return current
    } else if (Array.isArray(node.children)) {
      if (node.type === `list`) {
        current.items = node.children.map(i => processToC(i, {}))
        return current
      } else if (node.type === `listItem`) {
        const heading = processToC(node.children[0], {})
        if (node.children.length > 1) {
          processToC(node.children[1], heading)
        }
        return heading
      }
    }
    return {}
  }

  return (tree, file): void => {
    const generatedToC = toc(tree, { maxDepth })
    const mdxFile: IMdxVFile = file
    if (!mdxFile.data.meta) {
      mdxFile.data.meta = {}
    }

    mdxFile.data.meta.toc = processToC(generatedToC.map, {})
  }
}

export default remarkInferTocMeta
