import React from "react"
import { Script, ScriptStrategy } from "gatsby-script"
import { scripts } from "./scripts"

// Load Jquery where path = `adds-scripts-via-gatsby-browser`
export const wrapPageElement = ({ element, props }) => {
  const path = `adds-scripts-via-gatsby-browser`
  return (
    <div {...props}>
      {element}
      {props.path.includes(path) && (
        <Script
          id={`wrapPageElement-${ScriptStrategy.postHydrate}`}
          src={scripts.jQuery}
          strategy={ScriptStrategy.postHydrate}
        />
      )}
    </div>
  )
}
// Wraps the root element and load a script
export const wrapRootElement = ({ element, ...props }) => {
  return (
    <div>
      {element}
      <Script src={scripts.popper} strategy={ScriptStrategy.idle} />
    </div>
  )
}
