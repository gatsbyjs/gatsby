import * as React from "react"
import { data } from "../../../shared-data/head-function-export"

export default function HeadFunctionExportInvalidElements() {
  return (
    <>
      <h1>I test usage for the Head function export with invalid elements</h1>
    </>
  )
}

export function Head() {
  return (
    <>
      <h1>Big, big energy</h1>
      <div>A div-ersion</div>
      <audio>Feast for your ears</audio>
      <video>Feast for your eyes and ears</video>
      <title data-testid="title">{data.invalidElements.title}</title>
    </>
  )
}
