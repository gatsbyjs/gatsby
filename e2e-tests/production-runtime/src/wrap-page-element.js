import * as React from "react"
import { Script } from "gatsby"
import { scripts } from "../gatsby-script-scripts"
import { WrapRootTesterComponent } from "./wrap-root-context"

const gatsbyScriptTestPage = `/gatsby-script-ssr-browser-apis/`

export default ({ element, props }) => {
  return (
    <>
      {element}
      {props?.path?.includes(gatsbyScriptTestPage) && (
        <>
          <Script src={scripts.three} strategy="post-hydrate" />
          <Script src={scripts.marked} strategy="idle" />
        </>
      )}
      <WrapRootTesterComponent />
    </>
  )
}
