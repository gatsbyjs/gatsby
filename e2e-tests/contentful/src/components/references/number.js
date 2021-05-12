import React from "react"

export const ContentfulContentTypeNumber = ({ integer, decimal }) => (
  <p data-cy-id="integer">[ContentfulContentTypeNumber] {integer || decimal}</p>
)
