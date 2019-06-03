import React, { Fragment } from "react"
import { Styled } from "theme-ui"

/**
 * Shadow me to add your own footer content
 */

export default () => (
  <Fragment>
    <Styled.a
      href="https://twitter.com/gatsbyjs"
      target="_blank"
      rel="noopener noreferrer"
    >
      twitter
    </Styled.a>
    {` `}
    &bull;{` `}
    <Styled.a
      href="https://github.com/gatsbyjs"
      target="_blank"
      rel="noopener noreferrer"
    >
      github
    </Styled.a>
  </Fragment>
)
