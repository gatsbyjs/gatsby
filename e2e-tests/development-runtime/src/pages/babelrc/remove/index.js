import React from "react"

export default function BabelrcRemove() {
  return (
    <>
      <p>
        Code block below should contain <code>babel-rc-will-be-deleted</code>{" "}
        first and after removal it should contain <code>babel-rc-test</code>
      </p>
      <pre data-testid="test-element">babel-rc-test</pre>
    </>
  )
}
