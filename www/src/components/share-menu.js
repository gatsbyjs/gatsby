import React, { Fragment } from "react"
import MdShare from "react-icons/lib/md/share"
import FaPinterestP from "react-icons/lib/fa/pinterest-p"
import FaGooglePlus from "react-icons/lib/fa/google-plus"
import FaLinkedin from "react-icons/lib/fa/linkedin"
import FaFacebook from "react-icons/lib/fa/facebook"
import FaTwitter from "react-icons/lib/fa/twitter"

import presets, { colors } from "../utils/presets"
import { rhythm } from "../utils/typography"

const objectToParams = object =>
  `?` +
  Object.keys(object)
    .filter(key => !!object[key])
    .map(key => `${key}=${encodeURIComponent(object[key])}`)
    .join(`&`)

class ShareMenu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
    }
    this.shareMenu = this.shareMenu.bind(this)
  }

  shareMenu() {
    const { open } = this.state
    this.setState({
      open: !open,
    })
  }

  render() {
    const { url, title, image } = this.props
    const { open } = this.state
    return (
      <Fragment>
        <button
          onClick={this.shareMenu}
          css={{
            background: colors.gatsby,
            border: 0,
            borderRadius: presets.radius,
            color: `#fff`,
            cursor: `pointer`,
          }}
        >
          <MdShare />
        </button>
        {open && (
          <div
            css={{
              position: `absolute`,
              top: 44,
              left: `auto`,
              right: 0,
            }}
          >
            <a
              {...linkAttrs}
              href={`https://pinterest.com/pin/create/button/${objectToParams({
                url: url,
                media: image,
                description: title,
              })}`}
              title="Share on Pinterest'"
            >
              <FaPinterestP />
            </a>
            <a
              {...linkAttrs}
              href={`https://www.linkedin.com/shareArticle${objectToParams({
                mini: `true`,
                url: url,
                title: title,
              })}`}
              title="Share on LinkedIn"
            >
              <FaLinkedin />
            </a>
            <a
              {...linkAttrs}
              href={`https://www.facebook.com/sharer.php${objectToParams({
                u: url,
                t: title,
              })}`}
              title="Share on Facebook"
            >
              <FaFacebook />
            </a>
            <a
              {...linkAttrs}
              href={`https://plus.google.com/share${objectToParams({
                url: url,
              })}`}
              title="Share on Google Plus"
            >
              <FaGooglePlus />
            </a>
            <a
              {...linkAttrs}
              href={`https://twitter.com/share${objectToParams({
                url: url,
                text: title,
              })}`}
              title="Share on Twitter"
            >
              <FaTwitter />
            </a>
          </div>
        )}
      </Fragment>
    )
  }
}

export default ShareMenu

const styles = {
  shareMenuListItem: {
    width: 32,
    height: 32,
    marginBottom: rhythm(1.5 / 4),
    "&&": {
      background: colors.gatsby,
      border: 0,
      borderRadius: presets.radius,
      boxShadow: `none`,
      color: `#fff`,
      display: `flex`,
      alignItems: `center`,
      justifyContent: `center`,
      "&:hover": {
        background: colors.gatsby,
      },
    },
  },
}

const linkAttrs = {
  css: { ...styles.shareMenuListItem },
  target: `_blank`,
  rel: `noopener noreferrer`,
}
