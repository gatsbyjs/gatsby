import React from "react"

export default function ErrorPath({ serverData }) {
  return (
    <div>This will never render</div>
  )
}

export async function getServerData() {
  throw new Error(`Some runtime error`)
}
