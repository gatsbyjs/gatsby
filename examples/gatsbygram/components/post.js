import React from 'react'
import { presets } from 'glamor'
import HeartIcon from 'react-icons/lib/fa/heart'
import Link from 'gatsby-link'
import { rhythm, scale } from '../utils/typography'

class Post extends React.Component {
  constructor () {
    super()
    this.state = {
      hovering: false,
    }
  }

  render () {
    const { image, likes, id } = this.props.post
    const { small } = image.children[0]
    return (
      <Link
        to={`/${id}/`}
        onMouseEnter={() => {
          this.setState({ hovering: true })
        }}
        onMouseLeave={() => {
          this.setState({ hovering: false })
        }}
        css={{
          display: `block`,
          backgroundColor: `lightgray`,
          flex: `1 0 0%`,
          marginRight: rhythm(1/8),
          width: `100%`,
          maxWidth: 290.1,
          position: `relative`,
          [presets.Tablet]: {
            marginRight: rhythm(1),
          },
          ':last-child': {
            marginRight: 0,
          },
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
            src={small.src}
            srcSet={small.srcSet}
            sizes="(max-width: 960px) 33vw, 292px}"
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
        {/* overlay */}
        {this.state.hovering &&
          <div
            css={{
              position: `absolute`,
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: `rgba(0,0,0,0.3)`,
              display: `flex`,
              justifyContent: `center`,
              alignItems: `center`,
              color: `white`,
              ...scale(2/5),
            }}
          >
            <HeartIcon
              css={{
                fontSize: `90%`,
                marginRight: rhythm(1/4),
              }}
            /> {likes}
          </div>
        }
      </Link>
    )
  }
}

export default Post
