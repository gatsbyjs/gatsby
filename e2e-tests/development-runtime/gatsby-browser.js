// const Wrapper = require(`./src/wrap-root-element`).default
import WrapRootElement from "./src/wrap-root-element"
import * as React from "react"

if (typeof window !== `undefined`) {
  window.___PageComponentLifecycleCallsLog = []
}

const addLogEntry = (action, location) => {
  window.___PageComponentLifecycleCallsLog.push({
    action,
    pathname: location.pathname,
  })
}

// export const onPreRouteUpdate = ({ location }) => {
//   addLogEntry(`onPreRouteUpdate`, location)
// }

// export const onRouteUpdate = ({ location }) => {
//   addLogEntry(`onRouteUpdate`, location)
// }
// export const onPrefetchPathname = ({ pathname }) => {
//   addLogEntry(`onPrefetchPathname`, pathname)
// }

export const wrapPageElement = ({ element }) => {
  return <div style={{ borderLeft: "30px solid yellow" }}>{element}</div>
}

export const wrapRootElement = ({ element }) => (
  <WrapRootElement element={element} />
)
