import * as React from "react"

import "./not-visited-plain-css.css"
// UNCOMMENT-IN-TEST import "./not-visited-plain-css-not-imported-initially.css"

export default function PlainCss() {
  return (
    <>
      <p>
        This content doesn't matter - we never visit this page in tests - but
        because we generate single global .css file, we want to test changing
        css files imported by this module (and also adding new css imports).css
      </p>
      <p>css imported by this template is tested in `./plain-css.js` page</p>
    </>
  )
}
