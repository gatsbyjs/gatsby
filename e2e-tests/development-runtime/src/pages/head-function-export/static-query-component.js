import * as React from "react"
import HeadComponent from "../../components/head-function-export"

export default function HeadFunctionExportStaticQueryComponent() {
  return (
    <>
      <h1>I test usage for the Head function export via a common component</h1>
      <p>Some other words</p>
    </>
  )
}

export function Head() {
  return <HeadComponent />
}
