import React from "react"
import GUI from "../components/gui"
import { Location } from "@reach/router"
import queryString from "query-string"

export default function Recipe() {
  return (
    <Location>
      {({ location }) => {
        const params = queryString.parse(location.search)
        return <GUI recipe={params.name} />
      }}
    </Location>
  )
}
