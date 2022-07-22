import * as React from "react"
import * as fs from "fs"

export function onRenderBody({ setHeadComponents }) {
  setHeadComponents(
    <style
      dangerouslySetInnerHTML={{
        __html: `body {\nbackground: white;\n}`,
      }}
    />
  )
}

export function wrapPageElement({ element }) {
  return (
    <>
      <h1>(to match gatsby-browser structure without using same imports)</h1>
      {element}
    </>
  )
}

export function wrapRootElement({ element }) {
  return (
    <>
      <div>
        (to match src/components/github.js structure without using same imports)
      </div>
      {element}
    </>
  )
}
