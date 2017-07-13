import React from "react"
import { Link, NavLink } from "react-router-dom"
import PropTypes from "prop-types"

let pathPrefix = ``
if (__PREFIX_PATHS__) {
  pathPrefix = __PATH_PREFIX__
}

const isModifiedEvent = (event) =>
  !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)

class GatsbyLink extends React.Component {
  constructor(props) {
    super()
    this.state = {
      to: pathPrefix + props.to,
    }
  }
  propTypes: {
    to: PropTypes.string.isRequired,
    activeClassName: PropTypes.string,
    activeStyle: PropTypes.object,
    onClick: PropTypes.func,
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.to !== nextProps.to) {
      this.setState({
        to: pathPrefix + nextProps.to,
      })
      ___loader.enqueue(this.state.to)
    }
  }

  componentDidMount() {
    ___loader.enqueue(this.state.to)
  }

  render() {
    const { onClick, ...rest } = this.props
    if (this.props.activeStyle || this.props.activeClassName) {
      var El = NavLink
    } else {
      var El = Link
    }

    return (
      <El
        onClick={e => {
          onClick && onClick(e)
          // Is this link pointing to a hash on the same page? If so,
          // just scroll there.
          let pathname = this.state.to
          if (pathname.split(`#`).length > 1) {
            pathname = pathname.split(`#`).slice(0, -1).join(``)
          }
          if (pathname === window.location.pathname) {
            const hashFragment = this.state.to.split(`#`).slice(1).join(`#`)
            const element = document.getElementById(hashFragment)
            if (element !== null) {
              element.scrollIntoView()
              return true
            }
          }

          if (this.shouldControlNavigation(e)) {
            e.preventDefault()
            window.___navigateTo(this.state.to)
          }
        }}
        {...rest}
        to={this.state.to}
      />
    )
  }

  shouldControlNavigation(event) {
    // In production, make sure the necessary scripts are
    // loaded before continuing.
    return process.env.NODE_ENV === `production` &&
      !event.defaultPrevented &&    // onClick prevented default
      event.button === 0 &&         // ignore right clicks
      !this.props.target &&         // let browser handle "target=_blank"
      !isModifiedEvent(event)       // ignore clicks with modifier keys
  }
}

GatsbyLink.contextTypes = {
  router: PropTypes.object,
}

export default GatsbyLink

export const navigateTo = pathname => {
  window.___navigateTo(pathname)
}
