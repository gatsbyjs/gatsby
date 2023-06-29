import { ContentType, ContentTypeField } from "contentful"
import { MarkdownFieldDefinition } from "./types/plugin"

// When iterating on tons of objects, we don't want to block the event loop
// this helper function returns a promise that resolves on the next tick so that the event loop can continue before we continue running blocking code
export function untilNextEventLoopTick(): Promise<null> {
  return new Promise(res => {
    setImmediate(() => {
      res(null)
    })
  })
}

export function detectMarkdownField(
  field: ContentTypeField,
  contentTypeItem: ContentType,
  enableMarkdownDetection: boolean,
  markdownFields: MarkdownFieldDefinition
): string {
  let typeName = field.type as string

  if (typeName == `Text` && enableMarkdownDetection) {
    typeName = `Markdown`
  }

  // Detect markdown based on given field ids
  const markdownFieldDefinitions = markdownFields.get(contentTypeItem.sys.id)
  if (markdownFieldDefinitions && markdownFieldDefinitions.includes(field.id)) {
    typeName = `Markdown`
  }

  return typeName
}
