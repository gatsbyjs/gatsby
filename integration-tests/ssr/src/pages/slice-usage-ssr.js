import React from "react"
import { Slice } from "gatsby"

export default function SliceUsage({ serverData }) {
  return (
    <>
      <h1>Hi</h1>
      <Slice alias="test" />
      <pre>{JSON.stringify(serverData)}</pre>
    </>
  )
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
