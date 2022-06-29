import * as React from "react"
import HeadComponent from "../../components/head-function-export"

export default function HeadFunctionExportStaticQueryComponent() {
  return (
    <>
      <h1>I test usage for the head function export via a common component</h1>
      <p>Some other words</p>
    </>
  )
}

export function head() {
  return <HeadComponent />
}
