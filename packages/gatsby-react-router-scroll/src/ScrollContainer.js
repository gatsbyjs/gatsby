import React from "react"
import ReactDOM from "react-dom"
import warning from "warning"
import PropTypes from "prop-types"
import { ScrollBehaviorContext } from "./ScrollBehaviorContext"

const propTypes = {
  scrollKey: PropTypes.string.isRequired,
  shouldUpdateScroll: PropTypes.func,
  children: PropTypes.element.isRequired,
}

class ScrollContainer extends React.Component {
  constructor(props) {
    super(props)

    // We don't re-register if the scroll key changes, so make sure we
    // unregister with the initial scroll key just in case the user changes it.
    this.scrollKey = props.scrollKey
  }

  componentDidMount() {
    this.props.context.registerElement(
      this.props.scrollKey,
      ReactDOM.findDOMNode(this), // eslint-disable-line react/no-find-dom-node
      this.shouldUpdateScroll
    )

    // Only keep around the current DOM node in development, as this is only
    // for emitting the appropriate warning.
    if (process.env.NODE_ENV !== `production`) {
      this.domNode = ReactDOM.findDOMNode(this) // eslint-disable-line react/no-find-dom-node
    }
  }

  componentDidUpdate(prevProps) {
    warning(
      prevProps.scrollKey === this.props.scrollKey,
      `<ScrollContainer> does not support changing scrollKey.`
    )
    if (process.env.NODE_ENV !== `production`) {
      const prevDomNode = this.domNode
      this.domNode = ReactDOM.findDOMNode(this) // eslint-disable-line react/no-find-dom-node

      warning(
        this.domNode === prevDomNode,
        `<ScrollContainer> does not support changing DOM node.`
      )
    }
  }

  componentWillUnmount() {
    this.props.context.unregisterElement(this.scrollKey)
  }

  shouldUpdateScroll = (prevRouterProps, routerProps) => {
    const { shouldUpdateScroll } = this.props
    if (!shouldUpdateScroll) {
      return true
    }

    // Hack to allow accessing scrollBehavior._stateStorage.
    return shouldUpdateScroll.call(
      this.props.context.scrollBehavior,
      prevRouterProps,
      routerProps
    )
  }

  render() {
    return this.props.children
  }
}

const ScrollContainerConsumer = props => (
  <ScrollBehaviorContext.Consumer>
    {context => <ScrollContainer {...props} context={context} />}
  </ScrollBehaviorContext.Consumer>
)

ScrollContainerConsumer.propTypes = propTypes

export default ScrollContainerConsumer
