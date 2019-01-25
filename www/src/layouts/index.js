import React from "react"
import PluginLibraryWrapper from "../components/layout/plugin-library-wrapper"

export default props => {
  if (props.pageContext.layout === `plugins`) {
    return (
      <PluginLibraryWrapper location={props.location}>
        {props.children}
      </PluginLibraryWrapper>
    )
  }
  return <>{props.children}</>
}
