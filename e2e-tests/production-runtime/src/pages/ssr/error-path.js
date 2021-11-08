import React from "react"

export default function ErrorPath({ serverData }) {
  return (
    <div>
      <div>This will never render</div>
    </div>
  )
}

export function getServerData() {
  throw new Error(`Some runtime error`)
}
