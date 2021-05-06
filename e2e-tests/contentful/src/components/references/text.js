import React from "react"

export const ContentfulContentTypeText = ({ short, longPlain }) => (
  <p data-cy-id="text">[ContentfulText] {short || longPlain?.raw}</p>
)
