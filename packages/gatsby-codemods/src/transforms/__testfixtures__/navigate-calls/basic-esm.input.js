/* eslint-disable */
import React from "react"
import { navigateTo } from "gatsby-link"

// Don't use navigate with an onClick btw :-)
// Generally just use the `<Link>` component.
export default props => (
  <div onClick={() => navigateTo(`/`)}>Click to go to home</div >
)
