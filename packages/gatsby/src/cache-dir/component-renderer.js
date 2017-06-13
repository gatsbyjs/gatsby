import React, { createElement } from "react"
import loader from "./loader"
import emitter from "./emitter"

// Pass pathname in as prop.
// component will try fetching resources. If they exist,
// will just render, else will render null.
class ComponentRenderer extends React.Component {
  constructor(props) {
    super()
    console.log(`ComponentRenderer constructor`, props)
    this.state = {
      location: props.location,
      pageResources: loader.getResourcesForPathname(props.location.pathname),
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log(`componentWillReceiveProps`, nextProps)
    if (this.state.location.pathname !== nextProps.location.pathname) {
      // Ensure that pageResources are loaded before setting.
      // This is necessary in cases where the browser back button or forward
      // button is pushed so we can't be sure if resources are loaded yet.
      loader.getResourcesForPathname(
        nextProps.location.pathname,
        pageResources => {
          this.setState({
            location: nextProps.location,
            pageResources,
          })
        }
      )
    }
  }

  componentDidMount() {
    // Listen to events so when our page gets updated, we can transition.
    // This is only useful on delayed transitions as the page will get rendered
    // without the necessary page resources and then re-render once those come in.
    emitter.on(`onPostLoadPageResources`, e => {
      if (e.page.path === loader.getPage(this.state.location.pathname).path) {
        this.setState({ pageResources: e.pageResources })
      }
    })
  }

  render() {
    if (this.state.pageResources) {
      return createElement(this.state.pageResources.component, {
        ...this.props,
        ...this.state.pageResources.json,
      })
    } else {
      return null
    }
  }
}

export default ComponentRenderer
