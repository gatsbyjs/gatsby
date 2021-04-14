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
