import * as React from "react"
import "./sass-plain.scss"
import { componentClassName } from "./sass.module.scss"

export default function PlainCss() {
  return (
    <div style={{ color: `black` }}>
      <div data-testid="sass-styled-element" className="plain-sass-test">
        test
      </div>
      <div
        data-testid="sass-module-styled-element"
        className={componentClassName}
      >
        test
      </div>
    </div>
  )
}
