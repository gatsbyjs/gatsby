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
      <html lang="fr" style={{ color: 'black' }} />
      <body className="foo" />
      {children}
    </>
  )
}

export function Head() {
  return (
    <Indirection>
      <html data-foo="bar" style={{ background: 'white' }} />
      <body data-foo="baz" style={{ color: 'black', background: 'white' }} />
    </Indirection>
  )
}
