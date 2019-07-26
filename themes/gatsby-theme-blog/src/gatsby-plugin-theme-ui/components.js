import React from "react"
import PrismCodeBlock from "@theme-ui/prism"

import headings from "../components/headings"

export default {
  pre: ({ children }) => <>{children}</>,
  code: PrismCodeBlock,
  ...headings,
}
