import React from "react"
import { Head, Link } from "gatsby"

// NOTE: DOES render <Head />!
export default function HeadPage() {
  return (
    <>
      <Head
        title="Custom Title"
        description="Custom description"
        image="/custom-image.png"
      />
      <h1>Head</h1>
    </>
  )
}
