import React from "react"

export default function BabelrcBase() {
  return (
    <>
      <p>
        Code block below should contain <code>babel-rc-is-used</code> when
        compiled
      </p>
      <pre data-testid="test-element">babel-rc-test</pre>
    </>
  )
}
