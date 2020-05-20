import React from "react"
import PropTypes from "prop-types"
import SessionStorage from "./StateStorage"

export default class ScrollContext extends React.Component {
  constructor(props, context) {
    super(props, context)

    this._stateStorage = new SessionStorage()
  }

  scrollListener = () => {
    const { key } = this.props.location

    this._stateStorage.save(this.props.location, key, window.scrollY)
  }

  componentDidMount() {
    window.addEventListener(`scroll`, this.scrollListener)

    const scrollPosition = this._stateStorage.read(
      this.props.location,
      this.props.location.key
    )
    if (scrollPosition) {
      this.windowScroll(scrollPosition)
    } else if (this.props.location.hash) {
      this.scrollToHash(decodeURI(this.props.location.hash))
    }
  }

  componentWillUnmount() {
    window.removeEventListener(`scroll`, this.scrollListener)
  }

  componentDidUpdate(prevProps) {
    const { hash } = this.props.location

    const scrollPosition = this._stateStorage.read(
      this.props.location,
      this.props.location.key
    )
    if (scrollPosition) {
      this.windowScroll(scrollPosition, prevProps)
    } else if (hash) {
      this.scrollToHash(decodeURI(hash), prevProps)
    }
  }

  windowScroll = (position, prevProps) => {
    if (this.shouldUpdateScroll(prevProps, this.props)) {
      window.scroll(0, position)
    }
  }

  scrollToHash = (hash, prevProps) => {
    const node = document.querySelector(hash)

    if (node && this.shouldUpdateScroll(prevProps, this.props)) {
      node.scrollIntoView()
    }
  }

  shouldUpdateScroll = (prevRouterProps, routerProps) => {
    const { shouldUpdateScroll } = this.props
    if (!shouldUpdateScroll) {
      return true
    }

    // Hack to allow accessing this._stateStorage.
    return shouldUpdateScroll.call(this, prevRouterProps, routerProps)
  }

  render() {
    return this.props.children
  }
}

ScrollContext.propTypes = {
  shouldUpdateScroll: PropTypes.func,
  children: PropTypes.element.isRequired,
  location: PropTypes.object.isRequired,
}
