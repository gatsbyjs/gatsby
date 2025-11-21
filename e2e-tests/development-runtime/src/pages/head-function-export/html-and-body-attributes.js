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
      <html lang="fr" />
      <body className="foo" />
      {children}
    </>
  )
}

export function Head() {
  return (
    <Indirection>
      <html data-foo="bar" />
      <body data-foo="baz" />
    </Indirection>
  )
}
