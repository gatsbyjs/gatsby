import React from "react"

export const ContentfulNumber = ({ integer, decimal }) => (
  <p data-cy-id="integer">[ContentfulNumber] {integer || decimal}</p>
)
