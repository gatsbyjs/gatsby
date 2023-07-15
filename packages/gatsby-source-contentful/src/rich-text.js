// @ts-check
import { documentToReactComponents } from "@contentful/rich-text-react-renderer"
import resolveResponse from "contentful-resolve-response"

export function renderRichText({ raw, references }, options = {}) {
  const richText = JSON.parse(raw || null)

  // If no references are given, there is no need to resolve them
  if (!references || !references.length) {
    return documentToReactComponents(richText, options)
  }

  // Create dummy response so we can use official libraries for resolving the entries
  const dummyResponse = {
    items: [
      {
        sys: { type: `Entry` },
        richText,
      },
    ],
    includes: {
      Entry: references
        .filter(({ __typename }) => __typename !== `ContentfulAsset`)
        .map(reference => {
          return {
            ...reference,
            sys: { type: `Entry`, id: reference.contentful_id },
          }
        }),
      Asset: references
        .filter(({ __typename }) => __typename === `ContentfulAsset`)
        .map(reference => {
          return {
            ...reference,
            sys: { type: `Asset`, id: reference.contentful_id },
          }
        }),
    },
  }

  const resolved = resolveResponse(dummyResponse, {
    removeUnresolved: true,
  })

  return documentToReactComponents(resolved[0].richText, options)
}
