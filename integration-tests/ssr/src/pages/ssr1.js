import React from "react"

export default function SSR1({ serverData }) {
  return <pre>{JSON.stringify(serverData)}</pre>
}

export async function getServerData() {
  // make sure async works
  await new Promise(r => setTimeout(r, 500))
  return {
    props: {
      foo: `bar`,
    },
  }
}
