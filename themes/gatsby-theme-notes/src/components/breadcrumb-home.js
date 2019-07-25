import React from "react"
import { Link } from "gatsby"
import { Styled } from "theme-ui"

export default ({ text }) => (
  <Styled.a as={Link} to="/">
    {text}
  </Styled.a>
)
