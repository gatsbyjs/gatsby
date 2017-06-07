import React, { createElement } from "react"
import loader from "./loader"

// Pass pathname in as prop.
// component will try fetching resources. If they exist,
// will just render, else will render null.
class ComponentRenderer extends React.Component {
  constructor(props) {
    super()
    this.state = {
      pageResources: loader.getResourcesForPathname(props.location.pathname),
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.location.pathname !== nextProps.location.pathname) {
      this.setState({
        pageResources: loader.getResourcesForPathname(
          nextProps.location.pathname
        ),
      })
    }
  }

  componentDidMount() {
    // listen to events.
  }

  render() {
    console.log("rendering ComponentRenderer")
    if (this.state.pageResources) {
      return createElement(this.state.pageResources.component, {
        ...this.props,
        ...this.state.pageResources.json,
      })
    } else {
      return "...loading"
    }
  }
}

export default ComponentRenderer
