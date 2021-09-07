import React from "react"

export default function BabelrcAdd() {
  return (
    <>
      <p>
        Code block below should contain <code>babel-rc-test</code> first and
        after .babelrc addition it should contain <code>babel-rc-added</code>
      </p>
      <pre data-testid="test-element">babel-rc-test</pre>
    </>
  )
}
