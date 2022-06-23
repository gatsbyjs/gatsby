import * as React from "react"
import HeadComponent from "../../components/head-function-export"

export default function HeadFunctionExportStaticQueryComponentOverride() {
  return (
    <>
      <h1>
        I test usage for the head function export via a common component with
        overrides
      </h1>
      <p>Some other words</p>
    </>
  )
}

export function head() {
  return (
    <HeadComponent title="Override title">
      <meta
        data-testid="description"
        name="description"
        content="An extra description"
      />
    </HeadComponent>
  )
}
