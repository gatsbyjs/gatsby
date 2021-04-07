import React from "react"

export default function BabelrcEdit() {
  return (
    <>
      <p>
        Code block below should contain <code>babel-rc-initial</code> first and
        after edit it should contain <code>babel-rc-edited</code>
      </p>
      <pre data-testid="test-element">babel-rc-test</pre>
    </>
  )
}
