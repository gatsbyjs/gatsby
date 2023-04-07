import React from "react"
import GUI from "../components/recipes-gui"
import queryString from "query-string"

export default function Recipe({ location }) {
  const params = queryString.parse(location.search)
  return <GUI recipe={params.name} />
}
