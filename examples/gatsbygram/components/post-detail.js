import React from "react"
import HeartIcon from "react-icons/lib/fa/heart"

import presets from "../utils/presets"
import typography, { rhythm, scale } from "../utils/typography"

class PostDetail extends React.Component {
  constructor() {
    super()
  }

  render() {
    const { image, likes, id, username, weeksAgo, text, avatar } = this.props
      .post
    const { big } = image.children[0]

    const UserBar = () => (
      <div
        css={{
          [presets.Tablet]: {
            marginBottom: `calc(${rhythm(3 / 4)} + 1px)`,
            borderBottom: `1px solid rgba(0,0,0,0.1)`,
          },
        }}
      >
        <img
          src={avatar}
          alt={username}
          css={{
            borderRadius: `100%`,
            height: 25,
            float: `left`,
            margin: 0,
            marginRight: rhythm(1 / 2),
          }}
        />
        <h5
          css={{
            lineHeight: rhythm(1),
            marginBottom: rhythm(3 / 4),
          }}
        >
          {username}
        </h5>
      </div>
    )

    const PostDetails = () => (
      <div
        css={{
          ...scale(-2 / 5),
          lineHeight: typography.options.baseLineHeight,
        }}
      >
        <div
          css={{
            marginBottom: rhythm(1),
            overflow: `hidden`,
          }}
        >
          <strong
            css={{
              float: `left`,
            }}
          >
            {likes} likes
          </strong>
          <strong
            css={{
              color: `rgba(0,0,0,0.4)`,
              float: `right`,
            }}
          >
            {weeksAgo}w
          </strong>
        </div>
        <div>
          <strong>{username}</strong> {text}
        </div>
      </div>
    )

    return (
      <div
        onClick={e => e.stopPropagation()}
        css={{
          background: `white`,
          display: `flex`,
          alignItems: `stretch`,
          flexDirection: `column`,
          width: `100%`,
          [presets.Tablet]: {
            flexDirection: `row-reverse`,
            marginTop: rhythm(1),
          },
        }}
      >
        <div
          css={{
            padding: rhythm(3 / 4),
            paddingBottom: 0,
            [presets.Tablet]: {
              width: rhythm(13),
              padding: rhythm(1),
            },
          }}
        >
          <UserBar />
          <div
            css={{
              display: `none`,
              [presets.Tablet]: {
                display: `block`,
              },
            }}
          >
            <PostDetails />
          </div>
        </div>
        <div
          to={`/${id}/`}
          css={{
            display: `block`,
            backgroundColor: `lightgray`,
            flex: `1 0 0%`,
            width: `100%`,
            position: `relative`,
          }}
        >
          <div
            css={{
              flexDirection: `column`,
              flexShrink: 0,
              position: `relative`,
              paddingBottom: `100%`,
              overflow: `hidden`,
            }}
          >
            <img
              key={big.src}
              src={big.src}
              srcSet={big.srcSet}
              sizes="(min-width: 640px) 640px, 100vw"
              css={{
                margin: 0,
                height: `100%`,
                width: `100%`,
                verticalAlign: `baseline`,
                position: `absolute`,
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              }}
            />
            <div
              css={{
                flexDirection: `column`,
                flexShrink: 0,
                position: `absolute`,
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              }}
            />
          </div>
        </div>
        <div
          css={{
            background: `white`,
            padding: rhythm(3 / 4),
            display: `block`,
            [presets.Tablet]: {
              display: `none`,
            },
          }}
        >
          <PostDetails />
        </div>
      </div>
    )
  }
}

export default PostDetail
