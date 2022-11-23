import React from "react"

export const ContentfulContentReference = ({
  one,
  many,
  content_reference,
  title,
}) => {
  const references = [
    one,
    ...(many || []),
    ...(content_reference || []),
  ].filter(Boolean)
  return (
    <p data-cy-id="reference">
      [ContentfulReference] {title}: [
      {references.map(ref => ref.title).join(", ")}]
    </p>
  )
}
