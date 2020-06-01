import React from "react"
import { useTitle } from "../hooks/use-title"

export default function Imported() {
  const title = useTitle()
  return <div>{title}</div>
}
