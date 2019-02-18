/* eslint-disable */
import React from "react"
import { navigate } from 'gatsby';

// Don't use navigate with an onClick btw :-)
// Generally just use the `<Link>` component.
export default props => (
  <div onClick={() => navigate(`/`)}>Click to go to home</div >
)