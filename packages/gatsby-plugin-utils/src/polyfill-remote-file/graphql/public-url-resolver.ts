import { generatePublicUrl } from "../utils/url-generator"
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

  return (
    generatePublicUrl(
      {
        url: source.url,
        mimeType: source.mimeType,
      },
      false
    ) + `/${source.filename}`
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
