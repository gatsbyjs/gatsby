import React from "react"

export const ContentfulContentTypeContentReference = ({ one, many, title }) => {
  const references = [one, ...(many || [])].filter(Boolean)
  return (
    <p data-cy-id="reference">
      [ContentfulContentTypeContentReference] {title}: [
      {references.map(ref => ref.title).join(", ")}]
    </p>
  )
}
