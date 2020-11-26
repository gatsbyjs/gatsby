import React from "react"
import { Head, Link } from "gatsby"

// NOTE: DOES render <Head /> but only overrides description!
export default function HeadPage() {
  return (
    <>
      <Head description="Custom description" />
      <h1>Mixture</h1>
    </>
  )
}
