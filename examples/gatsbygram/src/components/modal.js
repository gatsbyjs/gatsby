import React from "react"
import Modal from "react-modal"
import CaretRight from "react-icons/lib/fa/caret-right"
import CaretLeft from "react-icons/lib/fa/caret-left"
import Close from "react-icons/lib/md/close"
import findIndex from "lodash/findIndex"
import mousetrap from "mousetrap"
import * as PropTypes from "prop-types"
import { navigate, StaticQuery, graphql } from "gatsby"

import { rhythm } from "../utils/typography"

let posts

Modal.setAppElement(`#___gatsby`)

// TODO(v6): Refactor this to a function component
class GatsbyGramModal extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    location: PropTypes.object.isRequired,
  }

  componentDidMount() {
    mousetrap.bind(`left`, () => this.previous())
    mousetrap.bind(`right`, () => this.next())
    mousetrap.bind(`space`, () => this.next())
  }

  componentWillUnmount() {
    mousetrap.unbind(`left`)
    mousetrap.unbind(`right`)
    mousetrap.unbind(`space`)
  }

  findCurrentIndex() {
    let index
    index = findIndex(
      posts,
      post => post.id === this.props.location.pathname.split(`/`)[1]
    )

    return index
  }

  next(e) {
    if (e) {
      e.stopPropagation()
    }
    const currentIndex = this.findCurrentIndex()
    if (currentIndex || currentIndex === 0) {
      let nextPost
      // Wrap around if at end.
      if (currentIndex + 1 === posts.length) {
        nextPost = posts[0]
      } else {
        nextPost = posts[currentIndex + 1]
      }
      navigate(nextPost.gatsbyPath)
    }
  }

  previous(e) {
    if (e) {
      e.stopPropagation()
    }
    const currentIndex = this.findCurrentIndex()
    if (currentIndex || currentIndex === 0) {
      let previousPost
      // Wrap around if at start.
      if (currentIndex === 0) {
        previousPost = posts.slice(-1)[0]
      } else {
        previousPost = posts[currentIndex - 1]
      }
      navigate(previousPost.gatsbyPath)
    }
  }

  // TODO(v6): Refactor to use `useStaticQuery` instead of `StaticQuery`, `StaticQuery` will be removed in v6
  render() {
    return (
      <StaticQuery
        query={graphql`
          query {
            allPostsJson {
              edges {
                node {
                  gatsbyPath(filePath: "/{PostsJson.id}")
                }
              }
            }
          }
        `}
        render={data => {
          if (!posts) {
            posts = data.allPostsJson.edges.map(e => e.node)
          }
          return (
            <Modal
              isOpen={this.props.isOpen}
              onRequestClose={() => navigate(`/`)}
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
                onClick={() => navigate(`/`)}
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
                    data-testid="previous-post"
                    css={{
                      cursor: `pointer`,
                      fontSize: `50px`,
                      color: `rgba(255,255,255,0.7)`,
                      userSelect: `none`,
                    }}
                    onClick={e => this.previous(e)}
                  />
                  {this.props.children}
                  <CaretRight
                    data-testid="next-post"
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
                  data-testid="modal-close"
                  onClick={() => navigate(`/`)}
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
        }}
      />
    )
  }
}

export default GatsbyGramModal
