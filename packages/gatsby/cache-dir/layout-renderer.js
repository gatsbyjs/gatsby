import React, { createElement } from "react"
import loader from "./loader"
import emitter from "./emitter"

const DefaultLayout = ({ children }) =>
  <div>
    {children()}
  </div>

class LayoutRenderer extends React.Component {
  constructor(props) {
    super()
    this.state = {
      location: props.location,
      pageResources: loader.getResourcesForPathname(props.location.pathname),
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.location.pathname !== nextProps.location.pathname) {
      this.setState({
        location: nextProps.location,
      })
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
    return createElement(this.state.pageResources.layout || DefaultLayout, {
      key: this.state.pageResources.layout,
      ...this.props,
    })
  }
}

export default LayoutRenderer
