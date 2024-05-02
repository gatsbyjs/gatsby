import { generateFileUrl } from "../utils/url-generator";
import {
  dispatchLocalFileServiceJob,
  shouldDispatchLocalFileServiceJob,
} from "../jobs/dispatchers";
// import type { Actions, Store } from "gatsby";
import type { IRemoteFileNode, IGraphQLFieldConfigDefinition } from "../types";

export function publicUrlResolver(
  source: IRemoteFileNode,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actions: any, // Actions,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store?: any | undefined, // Store | undefined,
): string {
  if (shouldDispatchLocalFileServiceJob()) {
    dispatchLocalFileServiceJob(
      {
        url: source.url,
        mimeType: source.mimeType,
        filename: source.filename,
        contentDigest: source.internal.contentDigest,
      },
      actions,
      store,
    );
  }

  return generateFileUrl(
    {
      url: source.url,
      mimeType: source.mimeType,
      filename: source.filename,
      internal: {
        contentDigest: source.internal.contentDigest,
      },
    },
    store,
  );
}

export function generatePublicUrlFieldConfig(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actions: any, // Actions,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store?: any | undefined, // Store | undefined,
): IGraphQLFieldConfigDefinition<IRemoteFileNode, string> {
  return {
    type: "String!",
    resolve(source): string {
      return publicUrlResolver(source, actions, store);
    },
  };
}
