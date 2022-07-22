import * as React from "react"
import { HeadProps } from "gatsby"

export default function TSXPageWithHeaExport() {
  return (
    <h1>
      I am a TS Page, I am used to test that Ts Pages with Head export work
    </h1>
  )
}

export function Head(props: HeadProps) {
  const text = `TypeScript`
  return (
    <>
      <title data-testid="title">{text}</title>
      <meta
        data-testid="name"
        content={text}
      />
    </>
  )
}
