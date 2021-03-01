import * as React from "react"

import "./plain-css.css"
// UNCOMMENT-IN-TEST import "./plain-css-not-imported-initially.css"

export default function PlainCss() {
  return (
    <div style={{ color: `black` }}>
      <div data-testid="styled-element" className="plain-css-test">
        test
      </div>
      <div
        data-testid="styled-element-that-is-not-styled-initially"
        className="plain-css-not-imported-initially"
      >
        test
      </div>
      <div
        data-testid="styled-element-by-not-visited-template"
        className="not-visited-plain-css-test"
      >
        test
      </div>
      <div
        data-testid="styled-element-that-is-not-styled-initially-by-not-visited-template"
        className="not-visited-plain-css-not-imported-initially "
      >
        test
      </div>
    </div>
  )
}
