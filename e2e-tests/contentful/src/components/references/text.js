import React from "react"

export const ContentfulContentTypeText = ({ short, longPlain }) => (
  <p data-cy-id="text">[ContentfulContentTypeText] {short || longPlain?.raw}</p>
)
