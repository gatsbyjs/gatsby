import React from "react"
import GUI from "../components/gui"

export default function Recipe({ location }) {
  return <GUI recipe={location.state.name} />
}
