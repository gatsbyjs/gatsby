import * as React from "react"
import "./stylus-plain.styl"
import { componentClassName } from "./stylus.module.styl"

export default function PlainCss() {
  return (
    <div style={{ color: `black` }}>
      <div data-testid="stylus-styled-element" className="plain-stylus-test">
        test
      </div>
      <div
        data-testid="stylus-module-styled-element"
        className={componentClassName}
      >
        test
      </div>
    </div>
  )
}
