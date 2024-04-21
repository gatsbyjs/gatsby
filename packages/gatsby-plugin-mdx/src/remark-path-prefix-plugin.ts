import type { Node } from "unist"
import { cachedImport } from "./cache-helpers"

// ensure only one `/` in new url
function withPathPrefix(url: string, pathPrefix: string): string {
  return (pathPrefix + url).replace(/\/\//, `/`)
}

// Ensure relative links include `pathPrefix`
export function remarkPathPlugin({
  pathPrefix,
}: {
  pathPrefix: string
}): (markdownAST: Node) => Promise<Node> {
  return async function transformer(markdownAST: Node): Promise<Node> {
    if (!pathPrefix) {
      return markdownAST
    }

    const { visit } =
      await cachedImport<typeof import("unist-util-visit")>(`unist-util-visit`)

    visit(markdownAST, [`link`, `definition`], (node: Node) => {
      const typedNode = node as { url?: string | undefined }
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
}
