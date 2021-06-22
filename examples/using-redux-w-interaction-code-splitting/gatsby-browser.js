/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/browser-apis/
 */

// You can delete this file if you're not using it

import * as React from "react"
import WrapRootElement from "./src/redux/reduxWrapper"

export const wrapRootElement = ({ element }) => (
  <WrapRootElement element={element} />
)
