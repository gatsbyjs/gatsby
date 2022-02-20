import { generatePublicUrl } from "../utils/url-generator"
import { getFileExtensionFromMimeType } from "../utils/mime-type-helpers"
import {
  dispatchLocalFileServiceJob,
  shouldDispatch,
} from "../jobs/dispatchers"
import type { Store } from "gatsby"
import type { IRemoteFileNode, IGraphQLFieldConfigDefinition } from "../types"

export function publicUrlResolver(
  source: IRemoteFileNode,
  store: Store
): string {
  if (shouldDispatch()) {
    dispatchLocalFileServiceJob(
      {
        url: source.url,
        mimeType: source.mimeType,
        contentDigest: source.internal.contentDigest,
      },
      store
    )
  }

  const extension = getFileExtensionFromMimeType(source.mimeType)
  return (
    generatePublicUrl({
      url: source.url,
      // We always want file based url
      mimeType: `application/octet-stream`,
    }) + `.${extension}`
  )
}

export function generatePublicUrlFieldConfig(
  store: Store
): IGraphQLFieldConfigDefinition<IRemoteFileNode, string> {
  return {
    type: `String!`,
    resolve(source): string {
      return publicUrlResolver(source, store)
    },
  }
}
