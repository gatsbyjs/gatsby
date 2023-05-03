import type { Node } from "unist"
import { cachedImport } from "./cache-helpers"

// ensure only one `/` in new url
const withPathPrefix = (url: string, pathPrefix: string): string =>
  (pathPrefix + url).replace(/\/\//, `/`)

// Ensure relative links include `pathPrefix`
export const remarkPathPlugin = ({ pathPrefix }: { pathPrefix: string }) =>
  async function transformer(markdownAST: Node): Promise<Node> {
    if (!pathPrefix) {
      return markdownAST
    }
    const { visit } = await cachedImport<typeof import("unist-util-visit")>(
      `unist-util-visit`
    )

    visit(markdownAST, [`link`, `definition`], (node: Node) => {
      const typedNode = node as { url?: string }
      if (
        typedNode.url &&
        typeof typedNode.url === `string` &&
        typedNode.url.startsWith(`/`) &&
        !typedNode.url.startsWith(`//`)
      ) {
        typedNode.url = withPathPrefix(typedNode.url, pathPrefix)
      }
    })
    return markdownAST
  }
