import WrapPageElement from "./src/wrap-page-element"
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

export const onPreRouteUpdate = ({ location }) => {
  addLogEntry(`onPreRouteUpdate`, location)
}

export const onRouteUpdate = ({ location }) => {
  addLogEntry(`onRouteUpdate`, location)
}
export const onPrefetchPathname = ({ pathname }) => {
  addLogEntry(`onPrefetchPathname`, pathname)
}

export const wrapPageElement = ({ element, props }) => (
  <WrapPageElement element={element} props={props} />
)

export const wrapRootElement = ({ element }) => (
  <WrapRootElement element={element} />
)
