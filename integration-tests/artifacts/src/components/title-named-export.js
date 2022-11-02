import React from "react"
import { useTitle } from "../hooks/use-title"

export function Title() {
  const title = useTitle()
  return <div>{title}</div>
}
