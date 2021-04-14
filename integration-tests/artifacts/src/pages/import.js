import React from "react"
import { useTitle } from "../hooks/use-title"

export default function Import() {
  const title = useTitle()
  return <div>{title}</div>
}
