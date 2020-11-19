import React from "react"

function CompileError() {
  // compile-error
  // a b
  const b = null;b.foo = 1
  return <p data-testid="hot">Working</p>
}

export default CompileError
