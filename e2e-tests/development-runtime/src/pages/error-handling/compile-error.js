import React from "react"

function CompileError() {
  // compile-error
  // a b
  const b = null;b.foo = 'bar'
  return <p data-testid="hot">Working</p>
}

export default CompileError
