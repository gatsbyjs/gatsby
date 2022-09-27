import reporter from "gatsby-cli/lib/reporter"
import type { IStructuredError } from "gatsby-cli/src/structured-errors/types"
import { IGatsbyPage, IGatsbyState } from "../redux/types"
import { ICollectedSlices } from "./babel/find-slices"

interface IPageDataBase {
  componentChunkName: IGatsbyPage["componentChunkName"]
  matchPath: IGatsbyPage["matchPath"]
  path: IGatsbyPage["path"]
  staticQueryHashes: Array<string>
  getServerDataError?: IStructuredError | Array<IStructuredError> | null
  manifestId?: string
}
export type IPageDataInput = IPageDataBase & {
  slices: Record<string, string>
  componentPath: string
}

export type IPageData = IPageDataBase & {
  slicesMap: Record<string, string>
}

function traverseSlicesUsedByTemplates(
  pagePath: string,
  componentPath: string,
  overrideSlices: Record<string, string>,
  slicesUsedByTemplates: Map<string, ICollectedSlices>,
  slices: IGatsbyState["slices"],
  formattedSlices: Record<string, string> = {},
  handledSlices: Set<string> = new Set<string>()
): Record<string, string> | null {
  if (handledSlices.has(componentPath)) {
    return null
  } else {
    handledSlices.add(componentPath)
  }

  const slicesUsedByComponent = slicesUsedByTemplates.get(componentPath)
  if (!slicesUsedByComponent) {
    return null
  }

  for (const [sliceSlot, sliceConf] of Object.entries(slicesUsedByComponent)) {
    let concreteSliceForSliceSlot = sliceSlot

    if (overrideSlices && overrideSlices[sliceSlot]) {
      concreteSliceForSliceSlot = overrideSlices[sliceSlot]
    }

    const slice = slices.get(concreteSliceForSliceSlot)
    if (!slice) {
      if (sliceConf.allowEmpty) {
        continue
      } else {
        const message =
          `Could not find slice "${concreteSliceForSliceSlot}" used by page "${pagePath}". ` +
          `Please check your createPages in your gatsby-node to verify this ` +
          `is the correct name or set allowEmpty to true.`

        reporter.panicOnBuild(new Error(message))
        continue
      }
    }

    formattedSlices[sliceSlot] = concreteSliceForSliceSlot

    // recursively repeat for found slice to find all nested slices
    traverseSlicesUsedByTemplates(
      pagePath,
      slice.componentPath,
      overrideSlices,
      slicesUsedByTemplates,
      slices,
      formattedSlices,
      handledSlices
    )
  }

  return formattedSlices
}

export function constructPageDataString(
  {
    componentChunkName,
    componentPath,
    matchPath,
    path: pagePath,
    staticQueryHashes,
    manifestId,
    slices: overrideSlices,
  }: IPageDataInput,
  result: string | Buffer,
  slicesUsedByTemplates: Map<string, ICollectedSlices>,
  slices: IGatsbyState["slices"]
): string {
  let body =
    `{` +
    `"componentChunkName":"${componentChunkName}",` +
    (pagePath ? `"path":${JSON.stringify(pagePath)},` : ``) +
    `"result":${result},` +
    `"staticQueryHashes":${JSON.stringify(staticQueryHashes)}`

  if (_CFLAGS_.GATSBY_MAJOR === `5` && process.env.GATSBY_SLICES) {
    const formattedSlices = traverseSlicesUsedByTemplates(
      pagePath,
      componentPath,
      overrideSlices,
      slicesUsedByTemplates,
      slices
    )

    if (formattedSlices) {
      body += `,"slicesMap":${JSON.stringify(formattedSlices)}`
    }
  }

  if (matchPath) {
    body += `,"matchPath":"${matchPath}"`
  }

  if (manifestId) {
    body += `,"manifestId":"${manifestId}"`
  }

  body += `}`

  return body
}

export function reverseFixedPagePath(pageDataRequestPath: string): string {
  return pageDataRequestPath === `index` ? `/` : pageDataRequestPath
}

export function getPagePathFromPageDataPath(
  pageDataPath: string
): string | null {
  const matches = pageDataPath.matchAll(
    /^\/?page-data\/(.+)\/page-data.json$/gm
  )
  for (const [, requestedPagePath] of matches) {
    return reverseFixedPagePath(requestedPagePath)
  }

  return null
}
