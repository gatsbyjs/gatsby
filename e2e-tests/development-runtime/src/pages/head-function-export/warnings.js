import * as React from "react"

export default function HeadFunctionExportWarnings() {
  return (
    <>
      <h1>
        I test usage for the Head function export that should result in warnings
      </h1>
    </>
  )
}

export function Head() {
  return (
    <>
      <h1 data-testid="h1">hello</h1>
    </>
  )
}
