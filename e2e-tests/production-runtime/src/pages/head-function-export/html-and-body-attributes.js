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
      <html lang="fr" style={{ accentColor: 'rgb(102, 51, 153)' }} />
      <body className="foo" />
      {children}
    </>
  )
}

export function Head() {
  return (
    <Indirection>
      <html data-foo="bar" style={{ border: '0px none rgba(0, 0, 0, 0.8)' }} />
      <body data-foo="baz" style={{ accentColor: 'rgb(102, 51, 153)', border: '0px none rgba(0, 0, 0, 0.8)' }} />
    </Indirection>
  )
}
