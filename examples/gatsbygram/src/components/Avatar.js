import * as PropTypes from "prop-types"
import React from "react"
import { rhythm } from "../utils/typography"
import { graphql } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

const propTypes = {
  user: PropTypes.shape({
    avatar: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }),
}

function Avatar({ user }) {
  return (
    <StaticImage
      src={
        "https://scontent-sjc3-1.cdninstagram.com/v/t51.2885-19/s320x320/179966117_255763296334587_3906825879185675712_n.jpg?tp=1&_nc_ht=scontent-sjc3-1.cdninstagram.com&_nc_ohc=__IJGmHUQDsAX-sMNmb&edm=ALwy07oBAAAA&ccb=7-4&oh=19939dc18cf3da2ec783b1e19a891121&oe=60AE6EA4&_nc_sid=261c40"
      }
      alt={user.username}
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
          width: rhythm(6),
          height: rhythm(6),
        },
      }}
    />
  )
}

Avatar.propTypes = propTypes

export default Avatar
export const userFragment = graphql`
  fragment Avatar_user on PostsJson {
    avatar
    username
  }
`
