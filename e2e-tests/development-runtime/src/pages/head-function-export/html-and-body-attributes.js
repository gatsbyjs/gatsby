import * as React from "react"

export default function HeadFunctionHtmlAndBodyAttributes() {
  return (
    <>
      <h1>I have html and body attributes</h1>
    </>
  )
}

function Indirection({ children }) {
  return (
    <>
      <body className="foo" data-foo="baz" />
      {children}
    </>
  )
}

export function Head() {
  return (
    <Indirection>
      <html data-foo="bar" lang="fr" />
    </Indirection>
  )
}
