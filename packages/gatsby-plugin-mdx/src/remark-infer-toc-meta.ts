import type { Plugin } from "unified"
import type { Node } from "unist"
import type {
  BlockContent,
  DefinitionContent,
  ListItem,
  TableCell,
} from "mdast"
import type { IMdxVFile } from "./types"
import type { Options, toc } from "mdast-util-toc"
import type { visit } from "unist-util-visit"

type TocNodeType = BlockContent | DefinitionContent | ListItem

interface IRemarkTocOptions {
  maxDepth?: Options["maxDepth"]
  toc: typeof toc
  visit: typeof visit
}

const remarkInferTocMeta: Plugin<[IRemarkTocOptions]> = options => {
  const { toc, visit, maxDepth }: IRemarkTocOptions = {
    maxDepth: 6,
    ...options,
  }

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

  return (tree: Node, file): void => {
    const generatedToC = toc(tree as TableCell, { maxDepth })
    const mdxFile: IMdxVFile = file
    if (!mdxFile.data.meta) {
      mdxFile.data.meta = {}
    }

    mdxFile.data.meta.toc = processToC(generatedToC.map as TocNodeType, {})
  }
}

export default remarkInferTocMeta
