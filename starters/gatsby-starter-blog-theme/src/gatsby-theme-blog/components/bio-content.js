import React, { Fragment } from "react"
import { Styled } from "theme-ui"

/**
 * Change the content to add your own bio
 */

export default () => (
  <Fragment>
    It's me, Winnie! I hope you're safe and sound, folks! What's that? You want to build your own site? Don't be shy. You can place <Styled.a href="http://example.com/">your name</Styled.a>
    {` `}
    here or wherever you like.
    <br />
    Now, where did I put my honey?
  </Fragment>
)
