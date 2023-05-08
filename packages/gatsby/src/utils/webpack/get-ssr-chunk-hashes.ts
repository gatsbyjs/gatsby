import type webpack from "webpack"
import type { IGatsbyState } from "../../internal"

type ChunkGroup = webpack.Compilation["chunkGroups"][0]

function getHashes(
  chunkGroup: ChunkGroup,
  compilation: webpack.Compilation,
  hashes: Array<string> = [],
  visitedChunkGroups: Set<ChunkGroup> = new Set()
): Array<string> {
  if (visitedChunkGroups.has(chunkGroup)) {
    return hashes
  }
  visitedChunkGroups.add(chunkGroup)

  for (const chunk of chunkGroup.chunks) {
    if (!chunk.hash) {
      throw new Error(
        `Invariant: [generating template hashes] Chunk doesn't have hash`
      )
    }
    hashes.push(chunk.hash)
  }

  for (const childChunkGroup of chunkGroup.childrenIterable) {
    const isNotImportedByAsyncRequires = childChunkGroup.origins.every(
      origin => !origin.module.identifier().includes(`async-requires`)
    )

    if (isNotImportedByAsyncRequires) {
      getHashes(childChunkGroup, compilation, hashes, visitedChunkGroups)
    }
  }

  return hashes
}

export function getSSRChunkHashes({
  stats,
  components,
}: {
  stats: webpack.Stats
  components: IGatsbyState["components"]
}): {
  templateHashes: Record<string, string>
  renderPageHash: string
} {
  const templateHashes: Record<string, string> = {}
  const componentChunkNameToTemplatePath: Record<string, string> = {}
  let renderPageHash = ``

  components.forEach(component => {
    componentChunkNameToTemplatePath[component.componentChunkName] =
      component.componentPath
  })

  for (const chunkGroup of stats.compilation.chunkGroups) {
    if (chunkGroup.name) {
      const concenatedChunksByName = getHashes(
        chunkGroup,
        stats.compilation
      ).join(`--`)

      if (chunkGroup.name !== `render-page`) {
        const templatePath = componentChunkNameToTemplatePath[chunkGroup.name]
        if (!templatePath) {
          // additional chunk group can be created by lazy imports
          // we handle them by handling children chunk groups on top level ones
          continue
        }
        templateHashes[templatePath] = concenatedChunksByName
      } else {
        renderPageHash = concenatedChunksByName
      }
    }
  }

  return { templateHashes, renderPageHash }
}
