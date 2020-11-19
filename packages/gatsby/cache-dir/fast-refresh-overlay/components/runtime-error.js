import React from "react"
import Overlay from "./overlay"

const RuntimeError = ({ problem, dismiss }) => {
  const header = (
    <p data-gatsby-overlay="header__runtime-error">Unhandled Runtime Error</p>
  )
  const body = <div>{problem.error.stack}</div>

  return <Overlay header={header} body={body} dismiss={dismiss} />
}

export default RuntimeError
