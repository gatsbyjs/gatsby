import React from "react"
import { Script } from "gatsby"

export const wrapPageElement = ({ element }) => {
  return (
    <>
      {element}
      <Script>{`console.log('success loading script in wrapPageElement')`}</Script>
    </>
  )
}

export const wrapRootElement = ({ element }) => {
  return (
    <>
      {element}
      <Script>{`console.log('success loading script in wrapRootElement')`}</Script>
    </>
  )
}
