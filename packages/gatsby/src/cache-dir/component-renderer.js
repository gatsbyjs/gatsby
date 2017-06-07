import React, { createElement } from "react"
import loader from "./loader"

// Pass pathname in as prop.
// component will try fetching resources. If they exist,
// will just render, else will render null.
class ComponentRenderer extends React.Component {
  render() {
    console.log("rendering ComponentRenderer")
    const pageResources = loader.getResourcesForPathname(
      this.props.location.pathname
    )
    if (pageResources) {
      return createElement(pageResources.component, {
        ...this.props,
        ...pageResources.json,
      })
    } else {
      return "...loading"
    }
  }
}

export default ComponentRenderer
