import { generateFileUrl } from "../utils/url-generator"
import {
  dispatchLocalFileServiceJob,
  shouldDispatch,
} from "../jobs/dispatchers"
import type { Actions, Store } from "gatsby"
import type { IRemoteFileNode, IGraphQLFieldConfigDefinition } from "../types"

export function publicUrlResolver(
  source: IRemoteFileNode,
  actions: Actions,
  store?: Store
): string {
  if (shouldDispatch()) {
    dispatchLocalFileServiceJob(
      {
        url: source.url,
        filename: source.filename,
        contentDigest: source.internal.contentDigest,
      },
      actions,
      store
    )
  }

  return generateFileUrl({ url: source.url, filename: source.filename }, store)
}

export function generatePublicUrlFieldConfig(
  actions: Actions,
  store?: Store
): IGraphQLFieldConfigDefinition<IRemoteFileNode, string> {
  return {
    type: `String!`,
    resolve(source): string {
      return publicUrlResolver(source, actions, store)
    },
  }
}
