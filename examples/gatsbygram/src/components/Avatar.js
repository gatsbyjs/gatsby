import * as PropTypes from 'prop-types'
import React from 'react'
import { rhythm } from '../utils/typography'

const propTypes = {
  user: PropTypes.shape({
    avatar: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }),
}

function Avatar({ user }) {
  return (
    <img
      src={user.avatar}
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
          width: `inherit`,
          height: `inherit`,
        },
      }}
    />
  )
}

Avatar.propTypes = propTypes

export default Avatar
export const userFragment = graphql`
  fragment Avatar_user on Posts {
    avatar
    username
  }
`
