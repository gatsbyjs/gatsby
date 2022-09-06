import * as path from "path"
import * as fs from "fs-extra"
import { generateHtmlPath } from "gatsby-core-utils/page-html"

interface ISliceBoundaryMatch {
  index: number
  end: number
  syntax: "element" | "comment"
  id: string
  type: "start" | "end"
}

function ensureExpectedType(maybeType: string): "start" | "end" {
  if (maybeType === `start` || maybeType === `end`) {
    return maybeType
  } else {
    throw new Error(`Unexpected type: ${maybeType}. Expected "start" or "end"`)
  }
}

async function stitchSlices(
  htmlString: string,
  publicDir: string
): Promise<string> {
  let previousStart: ISliceBoundaryMatch | undefined = undefined

  let processedHTML = ``
  let cursor = 0

  async function getSliceContent(sliceHtmlName: string): Promise<string> {
    return fs.readFile(
      path.join(publicDir, `_gatsby`, `slices`, `${sliceHtmlName}.html`),
      `utf-8`
    )
  }

  for (const match of htmlString.matchAll(
    /(<slice-(?<startOrEndElementOpenening>start|end)\s[^>]*id="(?<idElement>[^"]+)"[^>]*><\/slice-(?<startOrEndElementClosing>[^>]+)>|<!-- slice-(?<startOrEndComment>start|end) id="(?<idComment>[^"]+)" -->)/g
  )) {
    if (!match.groups) {
      throw new Error(`Wat #2, capturing groups not found`)
    }

    if (typeof match.index !== `number`) {
      throw new Error(`Wat #3, index is not a number`)
    }

    if (
      match.groups.startOrEndElementOpenening &&
      match.groups.startOrEndElementOpenening !==
        match.groups.startOrEndElementClosing
    ) {
      throw new Error(
        `WAT #1 not matching types ${match.groups.startOrEndElementOpenening} ${match.groups.startOrEndElementClosing}`
      )
    }

    const meta: ISliceBoundaryMatch = {
      index: match.index,
      end: match.index + match[0].length,
      ...(match.groups.startOrEndElementOpenening
        ? {
            syntax: `element`, // can discard this field
            id: match.groups.idElement,
            type: ensureExpectedType(match.groups.startOrEndElementOpenening),
          }
        : {
            syntax: `comment`, // can discard this field
            id: match.groups.idComment,
            type: ensureExpectedType(match.groups.startOrEndComment),
          }),
    }

    if (meta.type === `start`) {
      if (previousStart) {
        // if we are already in a slice, we will replace everything until the outer slice end
        // so we just ignore those
        continue
      }
      const newCursor = meta.end
      processedHTML +=
        htmlString.substring(cursor, meta.index) +
        `<!-- slice-start id="${meta.id}" -->`
      cursor = newCursor

      previousStart = meta
    } else if (meta.type === `end`) {
      if (!previousStart) {
        throw new Error(`something is closing without being opened before`)
      }
      if (previousStart.id !== meta.id) {
        console.log(
          `skipping "${meta.id}" because we are in "${previousStart.id}"`
        )
        continue
      }

      processedHTML += `${await stitchSlices(
        await getSliceContent(meta.id),
        publicDir
      )}<!-- slice-end id="${meta.id}" -->`
      cursor = meta.end

      previousStart = undefined
    }
  }

  if (previousStart) {
    console.log(previousStart)
    throw new Error(`Wat #3 - something wasn't closed`)
  }

  // get rest of the html
  processedHTML += htmlString.substring(cursor)

  return processedHTML
}

export async function stitchSliceForAPage({
  pagePath,
  publicDir,
}: {
  pagePath: string
  publicDir: string
}): Promise<void> {
  const htmlFilePath = generateHtmlPath(publicDir, pagePath)

  const html = await fs.readFile(htmlFilePath, `utf-8`)

  const processedHTML = await stitchSlices(html, publicDir)

  if (html !== processedHTML) {
    await fs.writeFile(htmlFilePath, processedHTML)
  }
}
