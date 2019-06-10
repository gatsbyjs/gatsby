import React from "react"
import { Link } from "gatsby"
import { Styled } from "theme-ui"

export default ({ files }) => (
  <ul>
    {files.map(url => (
      <li key={url}>
        <Styled.a as={Link} to={url}>
          {url}
        </Styled.a>
      </li>
    ))}
  </ul>
)
