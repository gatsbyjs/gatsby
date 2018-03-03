import * as PropTypes from "prop-types"
import React from "react"
import HeartIcon from "react-icons/lib/fa/heart"
import { Link } from "gatsby"

import { rhythm, scale } from "../utils/typography"
import presets from "../utils/presets"

let touched = false

class Post extends React.Component {
  static propTypes = {
    post: PropTypes.shape({
      smallImage: PropTypes.object,
      likes: PropTypes.number,
      id: PropTypes.string.isRequired,
    }).isRequired,
  }
  constructor() {
    super()
    this.state = {
      hovering: false,
    }
  }

  render() {
    const { smallImage, likes, id } = this.props.post
    const { small } = smallImage.childImageSharp
    return (
      <Link
        to={`/${id}/`}
        onTouchStart={() => (touched = true)}
        onMouseEnter={() => {
          if (!touched) {
            this.setState({ hovering: true })
          }
        }}
        onMouseLeave={() => {
          if (!touched) {
            this.setState({ hovering: false })
          }
        }}
        css={{
          display: `block`,
          flex: `1 0 0%`,
          marginRight: rhythm(1 / 8),
          width: `100%`,
          maxWidth: 290.1,
          position: `relative`,
          [presets.Tablet]: {
            marginRight: rhythm(1),
          },
          ":last-child": {
            marginRight: 0,
          },
        }}
      >
        <div
          css={{
            flexDirection: `column`,
            flexShrink: 0,
            position: `relative`,
            overflow: `hidden`,
          }}
        >
          <Img
            sizes={{ ...small }}
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
        {this.state.hovering && (
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
              ...scale(2 / 5),
            }}
          >
            <HeartIcon
              css={{
                fontSize: `90%`,
                marginRight: rhythm(1 / 4),
              }}
            />
            {` `}
            {likes}
          </div>
        )}
      </Link>
    )
  }
}

export default Post

export const postFragment = graphql`
  fragment Post_details on PostsJson {
    id
    likes
    smallImage: image {
      childImageSharp {
        small: sizes(maxWidth: 292, maxHeight: 292) {
          src
          srcSet
          aspectRatio
          sizes
          tracedSVG
        }
      }
    }
  }
`
