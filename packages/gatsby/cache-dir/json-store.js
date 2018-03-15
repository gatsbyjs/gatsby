import React, { createElement } from "react"
import { Route } from "react-router-dom"
import ComponentRenderer from "./component-renderer"
import syncRequires from "./sync-requires"
import omit from "lodash/omit"

class JSONStore extends React.Component {
  constructor(props) {
    super(props)
    this.state = { pages: {} }
  }

  componentDidMount() {
    // let io
    // try {
    //   io = window.io()
    // } catch (err) {
    //   console.error(`Could not connect to socket.io on dev server.`)
    // }
    // io &&
    //   io.on(`connection`, client => {
    //     client.on(`pages`, pages => {
    //       console.log(`got pages from client`, pages)
    //       this.setState({ pages })
    //     })
    //   })
  }

  componentWillReceiveProps(nextProps, nextState) {
    console.log(`props`, nextProps)
  }

  render() {
    const { page, pages } = this.props
    if (page) {
      const propsWithoutPages = omit(this.props, `pages`)
      return createElement(ComponentRenderer, {
        key: `normal-page`,
        ...propsWithoutPages,
      })
    } else {
      const dev404Page = pages.find(p => /^\/dev-404-page/.test(p.path))
      return createElement(Route, {
        key: `404-page`,
        component: props =>
          createElement(
            syncRequires.components[dev404Page.componentChunkName],
            {
              ...props,
              ...syncRequires.json[dev404Page.jsonName],
            }
          ),
      })
    }
  }
}

export default JSONStore
