import React from "react"
import { Link } from "react-router-dom"
import PropTypes from "prop-types"

let pathPrefix = ``
if (__PREFIX_PATHS__) {
  pathPrefix = __PATH_PREFIX__
}

class GatsbyLink extends React.Component {
  constructor(props) {
    super()
    this.state = {
      to: pathPrefix + props.to,
    }
  }
  propTypes: {
    to: PropTypes.string.isRequired,
    onClick: PropTypes.func,
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.to !== nextProps.to) {
      this.setState({
        to: pathPrefix + props.to,
      })
      ___loader.enqueue(this.state.to)
    }
  }

  componentDidMount() {
    ___loader.enqueue(this.state.to)
  }

  render() {
    const { onClick, ...rest } = this.props
    return (
      <Link
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

          // In production, make sure the necessary scripts are
          // loaded before continuing.
          if (process.env.NODE_ENV === `production`) {
            e.preventDefault()
            window.___navigateTo(this.state.to)
          }
        }}
        {...rest}
        to={this.state.to}
      />
    )
  }
}

GatsbyLink.contextTypes = {
  router: PropTypes.object,
}

export default GatsbyLink

export const navigateTo = pathname => {
  window.___navigateTo(pathname)
}
