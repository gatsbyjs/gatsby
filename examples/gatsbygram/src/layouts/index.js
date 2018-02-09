import * as PropTypes from "prop-types"
import React from "react"
import CameraIcon from "react-icons/lib/fa/camera-retro"
import { Link } from "gatsby"

// Load the css for the Space Mono font.
import "typeface-space-mono"

import { rhythm, scale } from "../utils/typography"
import presets from "../utils/presets"
import Modal from "../components/modal"

class DefaultLayout extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    children: PropTypes.func,
  }
  static childContextTypes = {
    setPosts: PropTypes.func,
  }
  getChildContext() {
    return {
      setPosts: posts => {
        this.posts = posts
      },
    }
  }

  componentDidMount() {
    // Create references to html/body elements
    this.htmlElement = document.querySelector(`html`)
    this.bodyElement = document.querySelector(`body`)

    // Cache the window width.
    this.windowWidth = window.innerWidth
  }
  componentWillReceiveProps(nextProps) {
    // if we're changing to a non-homepage page, put things in
    // a modal (unless we're on mobile).
    if (
      nextProps.location.pathname !== `/` &&
      nextProps.location.pathname !== `/about/` &&
      this.windowWidth > 750
    ) {
      // Freeze the background from scrolling.
      this.htmlElement.style.overflow = `hidden`
      this.bodyElement.style.overflow = `hidden`

      // Always set overflow-y to scroll so the scrollbar stays visible avoiding
      // weird jumping.
      this.htmlElement.style.overflowY = `scroll`
    } else {
      // Otherwise we're navigating back home so delete old home so the
      // modal can be destroyed.
      delete this.modalBackgroundChildren
      this.htmlElement.style.overflow = `visible`
      this.bodyElement.style.overflow = `visible`

      // Always set overflow-y to scroll so the scrollbar stays visible avoiding
      // weird jumping.
      this.htmlElement.style.overflowY = `scroll`
    }
  }

  render() {
    const { location } = this.props
    let isModal = false
    if (
      this.props.location.pathname !== `/` &&
      this.props.location.pathname !== `/about/` &&
      this.windowWidth > 750
    ) {
      isModal = true
    }

    return (
      <div
        css={{
          background: `rgba(0,0,0,0.03)`,
          minHeight: `100vh`,
        }}
      >
        <div
          css={{
            background: `white`,
            borderBottom: `1px solid rgba(0,0,0,0.08)`,
          }}
        >
          <div
            css={{
              padding: rhythm(3 / 4),
              paddingBottom: `calc(${rhythm(3 / 4)} - 1px)`,
              maxWidth: 960,
              margin: `0 auto`,
              overflow: `hidden`,
            }}
          >
            <Link
              to="/"
              css={{
                display: `inline-block`,
                float: `left`,
                textDecoration: `none`,
              }}
            >
              <h1
                css={{
                  ...scale(4 / 5),
                  lineHeight: 1,
                  margin: 0,
                  overflow: `hidden`,
                }}
              >
                <CameraIcon
                  css={{
                    top: -4,
                    display: `inline-block`,
                    position: `relative`,
                  }}
                />
                <span
                  css={{
                    paddingLeft: `calc(${rhythm(1)} - 1px)`,
                    borderLeft: `1px solid rgba(0,0,0,0.3)`,
                    lineHeight: 1,
                    marginLeft: rhythm(1),
                  }}
                >
                  Gatsbygram
                </span>
              </h1>
            </Link>
            <Link
              to="/about/"
              css={{
                color: `inherit`,
                display: `inline-block`,
                float: `right`,
                lineHeight: `35px`,
                textDecoration: `none`,
              }}
            >
              About
            </Link>
          </div>
        </div>
        <div
          css={{
            maxWidth: 960,
            margin: `0 auto`,
            [presets.Tablet]: {
              padding: rhythm(3 / 4),
            },
          }}
        >
          <div>
            {isModal
              ? this.props.children({
                  ...this.props,
                  location: { pathname: `/` },
                })
              : this.props.children()}
          </div>

          <div>
            {isModal && (
              <Modal isOpen={true} posts={this.posts} location={location}>
                {this.props.children}
              </Modal>
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default DefaultLayout
