import React from "react"
import { Link } from "gatsby"
import { Styled } from "theme-ui"

import useOptions from "../use-options"

export default ({ text }) => {
  const { basePath } = useOptions()

  return (
    <Styled.a as={Link} to={basePath}>
      {text}
    </Styled.a>
  )
}
