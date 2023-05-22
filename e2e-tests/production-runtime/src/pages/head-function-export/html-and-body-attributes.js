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
      <html data-foo="bar" style={{ caretColor: 'rgb(102, 51, 153)' }} />
      <body data-foo="baz" style={{ accentColor: 'rgb(102, 51, 153)', caretColor: 'rgb(102, 51, 153)' }} />
    </Indirection>
  )
}
