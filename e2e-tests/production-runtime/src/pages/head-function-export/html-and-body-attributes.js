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
      <body data-foo="baz" style={{ accentColor: 'rgb(102, 51, 153)', caretColor: 'rgb(102, 51, 153)' }} className="foo" />
      {children}
    </>
  )
}

export function Head() {
  return (
    <Indirection>
      <html data-foo="bar" style={{ accentColor: 'rgb(102, 51, 153)', caretColor: 'rgb(102, 51, 153)' }} lang="fr" />
    </Indirection>
  )
}
