import * as React from "react"
import { Script } from "gatsby"
import { scripts } from "../gatsby-script-scripts"
import { WrapRootContext } from "./wrap-root-context"

const gatsbyScriptTestPage = `/gatsby-script-ssr-browser-apis/`

export default ({ element, props }) => {
  const { title } = useContext(WrapRootContext)

  return (
    <>
      {element}
      {props?.path?.includes(gatsbyScriptTestPage) && (
        <>
          <Script src={scripts.three} strategy="post-hydrate" />
          <Script src={scripts.marked} strategy="idle" />
        </>
      )}
      <div>
        StaticQuery in wrapRootElement test (should show site title):
        <span data-testid="wrap-root-element-result">{title}</span>
      </div>
    </>
  )
}
