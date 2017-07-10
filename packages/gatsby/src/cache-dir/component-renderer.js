import React, { createElement } from "react"
import loader from "./loader"
import emitter from "./emitter"
import apiRunner from "./api-runner-browser"

// Pass pathname in as prop.
// component will try fetching resources. If they exist,
// will just render, else will render null.
class ComponentRenderer extends React.Component {
  constructor(props) {
    super()
    this.state = {
      location: props.location,
      pageResources: loader.getResourcesForPathname(props.location.pathname),
    }
    this.previousPageResources = {}
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.location.pathname !== nextProps.location.pathname) {
      const pageResources = loader.getResourcesForPathname(
        nextProps.location.pathname
      )
      if (!pageResources) {
        // Page resources won't be set in cases where the browser back button
        // or forward button is pushed as we can't wait as normal for resources
        // to load before changing the page.
        loader.getResourcesForPathname(
          nextProps.location.pathname,
          pageResources => {
            this.setState({
              location: nextProps.location,
              pageResources,
            })
          }
        )
      } else {
        this.setState({
          location: nextProps.location,
          pageResources,
        })
      }
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

  // Check if the component or json have changed
  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.state.pageResources.component !==
        nextState.pageResources.component ||
      this.state.pageResources.json !== nextState.pageResources.json
    ) {
      this.previousProps = this.props
      this.previousPageResources = this.state.pageResources
      return true
    }
    return false
  }

  render() {
    if (this.state.pageResources) {
      const pluginResponses = apiRunner(`replacePageComponentRenderer`, {
        previousPage: {
          props: this.previousProps,
          pageResources: this.previousPageResources,
        },
        nextPage: {
          props: this.props,
          pageResources: this.state.pageResources,
        },
      })

      const resolvedComponent = pluginResponses.length
        ? pluginResponses[pluginResponses.length - 1]
        : createElement(this.state.pageResources.component, {
            ...this.props,
            ...this.state.pageResources.json,
          })

      return resolvedComponent
    } else {
      return null
    }
  }
}

export default ComponentRenderer
