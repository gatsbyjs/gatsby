import * as React from "react"

export default function HeadFunctionExportWarnings() {
  return (
    <>
      <h1>
        I test usage for the head function export that should result in warnings
      </h1>
    </>
  )
}

export function head() {
  return (
    <>
      <h1 data-testid="h1">hello</h1>
      <script data-testid="script">{`console.log('hello')`}</script>
    </>
  )
}
