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
      <body className="foo" data-foo="baz" style={{ color: 'black', background: 'white' }} />
      {children}
    </>
  )
}

export function Head() {
  return (
    <Indirection>
      <html data-foo="bar" style={{ color: 'black', background: 'white' }} lang="fr" />
    </Indirection>
  )
}
