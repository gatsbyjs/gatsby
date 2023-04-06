import React from "react"

const LazyComponent = React.lazy(() =>
  import("../components/react-lazily-imported.js")
)

export default function PageUsingReactLazyComponent() {
  return <LazyComponent />
}
