import React, { createElement } from "react"
import PropTypes from "prop-types"
import loader, { publicLoader } from "./loader"
import emitter from "./emitter"
import { apiRunner } from "./api-runner-browser"

const DefaultLayout = ({ children }) => <div>{children()}</div>

// Pass pathname in as prop.
// component will try fetching resources. If they exist,
// will just render, else will render null.
class ComponentRenderer extends React.Component {
  constructor(props) {
    super()
    let location = props.location

    // Set the pathname for 404 pages.
    if (!loader.getPage(location.pathname)) {
      location = Object.assign({}, location, {
        pathname: `/404.html`,
      })
    }

    this.state = {
      location,
      pageResources: loader.getResourcesForPathname(props.location.pathname),
    }
  }

  componentWillReceiveProps(nextProps) {
    // During development, always pass a component's JSON through so graphql
    // updates go through.
    if (process.env.NODE_ENV !== `production`) {
      if (
        nextProps &&
        nextProps.pageResources &&
        nextProps.pageResources.json
      ) {
        this.setState({ pageResources: nextProps.pageResources })
      }
    }
    if (this.state.location.pathname !== nextProps.location.pathname) {
      const pageResources = loader.getResourcesForPathname(
        nextProps.location.pathname
      )
      if (!pageResources) {
        let location = nextProps.location

        // Set the pathname for 404 pages.
        if (!loader.getPage(location.pathname)) {
          location = Object.assign({}, location, {
            pathname: `/404.html`,
          })
        }

        // Page resources won't be set in cases where the browser back button
        // or forward button is pushed as we can't wait as normal for resources
        // to load before changing the page.
        loader.getResourcesForPathname(
          location.pathname,
          pageResources => {
            this.setState({
              location,
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
      if (
        loader.getPage(this.state.location.pathname) &&
        e.page.path === loader.getPage(this.state.location.pathname).path
      ) {
        this.setState({ pageResources: e.pageResources })
      }
    })
  }

  shouldComponentUpdate(nextProps, nextState) {
    // 404
    if (!nextState.pageResources) {
      return true
    }

    // Check if the component or json have changed.
    if (!this.state.pageResources && nextState.pageResources) {
      return true
    }

    if (
      this.state.pageResources.component !== nextState.pageResources.component
    ) {
      return true
    }

    if (this.state.pageResources.json !== nextState.pageResources.json) {
      return true
    }

    // Check if location has changed on a page using internal routing
    // via matchPath configuration.
    if (
      this.state.location.key !== nextState.location.key &&
      nextState.pageResources.page &&
      (nextState.pageResources.page.matchPath ||
        nextState.pageResources.page.path)
    ) {
      return true
    }

    return false
  }

  render() {
    const pluginResponses = apiRunner(`replaceComponentRenderer`, {
      props: { ...this.props, pageResources: this.state.pageResources },
      loader: publicLoader,
    })
    const replacementComponent = pluginResponses[0]
    // If page.
    if (this.props.page) {
      if (this.state.pageResources) {
        return (
          replacementComponent ||
          createElement(this.state.pageResources.component, {
            key: this.props.location.pathname,
            ...this.props,
            ...this.state.pageResources.json,
          })
        )
      } else {
        return null
      }
      // If layout.
    } else if (this.props.layout) {
      return (
        replacementComponent ||
        createElement(
          this.state.pageResources && this.state.pageResources.layout
            ? this.state.pageResources.layout
            : DefaultLayout,
          {
            key:
              this.state.pageResources && this.state.pageResources.layout
                ? this.state.pageResources.layout
                : `DefaultLayout`,
            ...this.props,
          }
        )
      )
    } else {
      return null
    }
  }
}

ComponentRenderer.propTypes = {
  page: PropTypes.bool,
  layout: PropTypes.bool,
  location: PropTypes.object,
}

export default ComponentRenderer
