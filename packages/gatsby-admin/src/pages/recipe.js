import React from "react"
import GUI from "../components/recipes-gui"

export default function Recipe({ location }) {
  const match = location.search.match(/[?&]name=([^&]+)/)
  return <GUI recipe={match ? match[1] : undefined} />
}
