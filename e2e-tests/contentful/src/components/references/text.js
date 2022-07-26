import React from "react"

export const ContentfulText = ({ short, longPlain }) => (
  <p data-cy-id="text">[ContentfulText] {short || longPlain?.longPlain}</p>
)
