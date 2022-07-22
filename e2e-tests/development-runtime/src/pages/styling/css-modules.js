import * as React from "react"

import { componentClassName } from "./css-modules.module.css"

export default function CssModules() {
  return (
    <div data-testid="styled-element" className={componentClassName}>
      test
    </div>
  )
}
