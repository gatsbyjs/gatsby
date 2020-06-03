// import { fixId } from "./normalize"
import { documentToReactComponents } from "@contentful/rich-text-react-renderer"
import resolveResponse from "contentful-resolve-response"

// We need the original id from contentful as id attribute
// This code can be simplified as soon we properly replicate
// Contentful's sys object
const prepareIdsForResolving = obj => {
  for (let k in obj) {
    const value = obj[k]
    if (
      value &&
      value.sys &&
      value.sys.type === `Link` &&
      value.sys.contentful_id
    ) {
      value.sys.id = value.sys.contentful_id
      delete value.sys.contentful_id
    } else if (value && typeof value === `object`) {
      prepareIdsForResolving(value)
    }
  }
}

function renderRichText({ raw, references }, options = {}) {
  const richText = JSON.parse(raw)

  // If no references are given, there is no need to resolve them
  if (!references || !references.length) {
    return documentToReactComponents(richText, options)
  }

  prepareIdsForResolving(richText)

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

exports.renderRichText = renderRichText
