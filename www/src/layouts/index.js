import React, { useState } from "react"

let PluginLibraryWrapper
export default props => {
  const [loaded, setLoaded] = useState(false)

  const promise = import(`../components/layout/plugin-library-wrapper`)
  if (props.pageContext.layout === `plugins` && !loaded) {
    promise.then(pl => {
      PluginLibraryWrapper = pl.default
      setLoaded(true)
    })
    return null
  } else if (props.pageContext.layout === `plugins` && loaded) {
    return (
      <PluginLibraryWrapper location={props.location}>
        {props.children}
      </PluginLibraryWrapper>
    )
  }
  return <>{props.children}</>
}
