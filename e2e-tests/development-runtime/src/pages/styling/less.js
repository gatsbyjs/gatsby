import * as React from "react"
import "./less-plain.less"
import { componentClassName } from "./less.module.less"

export default function PlainCss() {
  return (
    <div style={{ color: `black` }}>
      <div data-testid="less-styled-element" className="plain-less-test">
        test
      </div>
      <div
        data-testid="less-module-styled-element"
        className={componentClassName}
      >
        test
      </div>
    </div>
  )
}
