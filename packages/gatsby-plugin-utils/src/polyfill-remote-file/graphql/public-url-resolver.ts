import { generatePublicUrl } from "../utils/url-generator"
import {
  dispatchLocalFileServiceJob,
  shouldDispatch,
} from "../jobs/dispatchers"
import type { Actions } from "gatsby"
import type { IRemoteFileNode, IGraphQLFieldConfigDefinition } from "../types"

export function publicUrlResolver(
  source: IRemoteFileNode,
  actions: Actions
): string {
  if (shouldDispatch()) {
    dispatchLocalFileServiceJob(
      {
        url: source.url,
        filename: source.filename,
        mimeType: source.mimeType,
        contentDigest: source.internal.contentDigest,
      },
      actions
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
  actions: Actions
): IGraphQLFieldConfigDefinition<IRemoteFileNode, string> {
  return {
    type: `String!`,
    resolve(source): string {
      return publicUrlResolver(source, actions)
    },
  }
}
