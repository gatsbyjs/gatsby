import React from "react"
import GUI from "../components/recipes-gui"

export default function Recipe({ location }) {
  const params = new URLSearchParams(location.search)
  return <GUI recipe={params.get(`name`)} />
}
