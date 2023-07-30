import { ReactNode } from "react"
import { Options } from "@contentful/rich-text-react-renderer"

interface ContentfulRichTextGatsbyReference {
  /**
   * Either ContentfulAsset for assets or ContentfulYourContentTypeName for content types
   */
  __typename: string
  contentful_id: string
}

interface RenderRichTextData<T extends ContentfulRichTextGatsbyReference> {
  raw?: string | null
  references?: T[] | null
}

export function renderRichText<
  TReference extends ContentfulRichTextGatsbyReference
>(data: RenderRichTextData<TReference>, options?: Options): ReactNode
