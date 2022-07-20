import React from "react"

export default function SSRBad({ serverData }) {
  return <pre>{JSON.stringify(serverData)}</pre>
}

export async function getServerData() {
  // make sure async works
  await new Promise(r => setTimeout(r, 500))

  throw new Error(`network error, I swear`)
}
