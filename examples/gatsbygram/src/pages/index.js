import React from "react"
import chunk from "lodash/chunk"

import { rhythm, scale } from "../utils/typography"
import presets from "../utils/presets"
import Post from "../components/post"

// This would normally be in a Redux store or some other global data store.
if (typeof window !== `undefined`) {
  window.postsToShow = 12
}

class Index extends React.Component {
  constructor() {
    super()
    let postsToShow = 12
    if (typeof window !== `undefined`) {
      postsToShow = window.postsToShow
    }

    this.state = {
      showingMore: postsToShow > 12,
      postsToShow,
    }
  }

  update() {
    const distanceToBottom =
      document.documentElement.offsetHeight -
      (window.scrollY + window.innerHeight)
    if (this.state.showingMore && distanceToBottom < 100) {
      this.setState({ postsToShow: this.state.postsToShow + 12 })
    }
    this.ticking = false
  }

  handleScroll = () => {
    if (!this.ticking) {
      this.ticking = true
      requestAnimationFrame(() => this.update())
    }
  }

  componentDidMount() {
    window.addEventListener(`scroll`, this.handleScroll)
  }

  componentWillUnmount() {
    window.removeEventListener(`scroll`, this.handleScroll)
    window.postsToShow = this.state.postsToShow
  }

  render() {
    console.log(this.props)
    this.context.setEdges(this.props.data.allPosts.edges)
    return (
      <div
        css={{
          display: `flex`,
          alignItems: `stretch`,
          flexShrink: 0,
          flexDirection: `column`,
        }}
      >
        {/* user profile */}
        <div
          css={{
            paddingBottom: rhythm(2),
            paddingTop: rhythm(1.5),
            paddingLeft: rhythm(1.5),
            paddingRight: rhythm(1.5),
            display: `flex`,
            flexDirection: `row`,
            alignItems: `stretch`,
            flexWrap: `wrap`,
          }}
        >
          <div
            css={{
              marginRight: rhythm(1),
              flexGrow: 1,
              flexShrink: 0,
            }}
          >
            <img
              src={this.props.data.user.edges[0].node.avatar}
              alt={this.props.data.user.edges[0].node.username}
              css={{
                display: `block`,
                margin: `0 auto`,
                borderRadius: `100%`,
                width: rhythm(2),
                height: rhythm(2),
                [`@media (min-width: 460px)`]: {
                  width: rhythm(3),
                  height: rhythm(3),
                },
                [`@media (min-width: 525px)`]: {
                  width: rhythm(4),
                  height: rhythm(4),
                },
                [`@media (min-width: 600px)`]: {
                  width: `inherit`,
                  height: `inherit`,
                },
              }}
            />
          </div>
          <div
            css={{
              flexGrow: 2,
              flexShrink: 0,
              textAlign: `center`,
              [`@media (min-width: 600px)`]: {
                paddingTop: rhythm(1 / 2),
                textAlign: `left`,
              },
            }}
          >
            <h3
              css={{
                fontWeight: `normal`,
              }}
            >
              {this.props.data.allPosts.edges[0].node.username}
            </h3>
            <p>
              <strong>{this.props.data.allPosts.edges.length}</strong> posts
              <strong css={{ marginLeft: rhythm(1) }}>192k</strong> followers
            </p>
          </div>
        </div>
        {/* posts */}
        {chunk(
          this.props.data.allPosts.edges.slice(0, this.state.postsToShow),
          3
        ).map(chunk => {
          return (
            <div
              css={{
                display: `flex`,
                alignItems: `stretch`,
                flexShrink: 0,
                flexDirection: `row`,
                marginBottom: rhythm(1 / 8),
                [presets.Tablet]: {
                  marginBottom: rhythm(1),
                },
              }}
            >
              {chunk.map(edge => (
                <Post
                  key={edge.node.id}
                  post={edge.node}
                  edges={this.props.data.allPosts.edges}
                  location={this.props.location}
                  onClick={post => this.setState({ activePost: post })}
                />
              ))}
            </div>
          )
        })}
        {!this.state.showingMore &&
          <a
            css={{
              ...scale(-0.5),
              border: `1px solid blue`,
              boxShadow: 0,
              background: `none`,
              color: `blue`,
              cursor: `pointer`,
              margin: `0 auto`,
              padding: rhythm(1 / 2),
              width: `calc(100vw - ${rhythm(1)})`,
              marginLeft: rhythm(0.5),
              marginRight: rhythm(0.5),
              marginBottom: rhythm(0.5),
              marginTop: rhythm(0.5),
              [presets.Tablet]: {
                borderRadius: `100%`,
                width: `default`,
                margin: `0 auto`,
                marginBottom: rhythm(1.5),
                marginTop: rhythm(1.5),
                padding: rhythm(1),
                height: rhythm(5),
                width: rhythm(5),
                lineHeight: rhythm(3),
                textAlign: `center`,
              },
            }}
            onClick={() => {
              this.setState({
                postsToShow: this.state.postsToShow + 12,
                showingMore: true,
              })
            }}
          >
            Load More
          </a>}
      </div>
    )
  }
}

Index.contextTypes = {
  setEdges: React.PropTypes.func,
}

export default Index

export const pageQuery = `
query allImages {
  user: allPosts(limit: 1) { edges { node { avatar, username }}}
  allPosts {
    edges {
      node {
        likes
        id
        text
        weeksAgo: time(difference: "weeks")
        image {
          children {
            ... on ImageSharp {
              small: responsiveSizes(maxWidth: 292, maxHeight: 292) {
                src
                srcSet
              }
              big: responsiveSizes(maxWidth: 640, maxHeight: 640) {
                src
                srcSet
              }
            }
          }
        }
      }
    }
  }
}
`
