import React from "react"
import Modal from "react-modal"
import CaretRight from "react-icons/lib/fa/caret-right"
import CaretLeft from "react-icons/lib/fa/caret-left"
import Close from "react-icons/lib/md/close"
import findIndex from "lodash/findIndex"
import mousetrap from "mousetrap"
import * as PropTypes from "prop-types"
import { navigateTo } from "gatsby-link"

import { rhythm } from "../utils/typography"

class GatsbyGramModal extends React.Component {
  static propTypes = {
    isOpen: React.PropTypes.bool,
    location: React.PropTypes.object.isRequired,
    posts: React.PropTypes.array.isRequired,
  }

  componentDidMount() {
    mousetrap.bind(`left`, () => this.previous())
    mousetrap.bind(`right`, () => this.next())
    mousetrap.bind(`spacebar`, () => this.next())
  }

  componentWillUnmount() {
    mousetrap.unbind(`left`)
    mousetrap.unbind(`right`)
    mousetrap.unbind(`spacebar`)
  }

  findCurrentIndex() {
    let index
    index = findIndex(this.props.posts, post => {
      return post.id === this.props.location.pathname.split(`/`)[1]
    })

    return index
  }

  next(e) {
    if (e) {
      e.stopPropagation()
    }
    const currentIndex = this.findCurrentIndex()
    if (currentIndex || currentIndex === 0) {
      const posts = this.props.posts
      let nextPost
      // Wrap around if at end.
      if (currentIndex + 1 === posts.length) {
        nextPost = posts[0]
      } else {
        nextPost = posts[currentIndex + 1]
      }
      navigateTo(`/${nextPost.id}/`)
    }
  }

  previous(e) {
    if (e) {
      e.stopPropagation()
    }
    const currentIndex = this.findCurrentIndex()
    if (currentIndex || currentIndex === 0) {
      const posts = this.props.posts
      let previousPost
      // Wrap around if at start.
      if (currentIndex === 0) {
        previousPost = posts.slice(-1)[0]
      } else {
        previousPost = posts[currentIndex - 1]
      }
      navigateTo(`/${previousPost.id}/`)
    }
  }

  render() {
    console.log(this.props)
    console.log(`context`, this.context)
    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={() => navigateTo(`/`)}
        style={{
          overlay: {
            position: `fixed`,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: `rgba(0, 0, 0, 0.75)`,
          },
          content: {
            position: `absolute`,
            border: `none`,
            background: `none`,
            padding: 0,
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            overflow: `auto`,
            WebkitOverflowScrolling: `touch`,
          },
        }}
        contentLabel="Modal"
      >
        <div
          onClick={() => navigateTo(`/`)}
          css={{
            display: `flex`,
            position: `relative`,
            height: `100vh`,
          }}
        >
          <div
            css={{
              display: `flex`,
              alignItems: `center`,
              justifyItems: `center`,
              maxWidth: rhythm(40.25), // Gets it right around Instagram's maxWidth.
              margin: `auto`,
              width: `100%`,
            }}
          >
            <CaretLeft
              css={{
                cursor: `pointer`,
                fontSize: `50px`,
                color: `rgba(255,255,255,0.7)`,
                userSelect: `none`,
              }}
              onClick={e => this.previous(e)}
            />
            {console.log(`rendering modal`)}
            {console.log(this.props.children)}
            {this.props.children({
              location: { pathname: this.props.location.pathname },
            })}
            <CaretRight
              css={{
                cursor: `pointer`,
                fontSize: `50px`,
                color: `rgba(255,255,255,0.7)`,
                userSelect: `none`,
              }}
              onClick={e => this.next(e)}
            />
          </div>
          <Close
            onClick={() => navigateTo(`/`)}
            css={{
              cursor: `pointer`,
              color: `rgba(255,255,255,0.8)`,
              fontSize: `30px`,
              position: `absolute`,
              top: rhythm(1 / 4),
              right: rhythm(1 / 4),
            }}
          />
        </div>
      </Modal>
    )
  }
}

export default GatsbyGramModal

export const modalFragment = graphql`
  fragment Modal_posts on PostsJson {
    id
  }

`
