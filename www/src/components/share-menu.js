import React, { Fragment } from "react"
import MdShare from "react-icons/lib/md/share"
import FaPinterestP from "react-icons/lib/fa/pinterest-p"
import FaGooglePlus from "react-icons/lib/fa/google-plus"
import FaLinkedin from "react-icons/lib/fa/linkedin"
import FaFacebook from "react-icons/lib/fa/facebook"
import FaTwitter from "react-icons/lib/fa/twitter"

import { colors, space, radii } from "../utils/presets"

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
    this.clickOutsideShareMenu = this.clickOutsideShareMenu.bind(this)
    this.setShareBtnRef = this.setShareBtnRef.bind(this)
    this.setShareMenuRef = this.setShareMenuRef.bind(this)
  }

  componentDidMount() {
    document.addEventListener(`mousedown`, this.clickOutsideShareMenu)
  }

  componentWillUnmount() {
    document.removeEventListener(`mousedown`, this.clickOutsideShareMenu)
  }

  setShareBtnRef(node) {
    this.shareBtnref = node
  }

  setShareMenuRef(node) {
    this.shareMenuRef = node
  }

  clickOutsideShareMenu(event) {
    const { open } = this.state
    if (
      open &&
      !this.shareBtnref.contains(event.target) &&
      !this.shareMenuRef.contains(event.target)
    ) {
      this.shareMenu()
    }
  }

  shareMenu() {
    const { open } = this.state
    this.setState({
      open: !open,
    })
  }

  render() {
    const { url, title, image, className, theme = `gatsby` } = this.props
    const { open } = this.state
    return (
      <Fragment>
        <button
          onClick={this.shareMenu}
          css={{
            background: styles[theme].background,
            border: 0,
            borderRadius: radii[1],
            color: styles[theme].textColor,
            cursor: `pointer`,
          }}
          className={className}
          ref={this.setShareBtnRef}
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
            ref={this.setShareMenuRef}
          >
            <a
              {...linkAttrs}
              css={{ ...styles.shareMenuListItem[theme] }}
              href={`https://pinterest.com/pin/create/button/${objectToParams({
                url: url,
                media: image,
                description: title,
              })}`}
              title="Share on Pinterest"
            >
              <FaPinterestP />
            </a>
            <a
              {...linkAttrs}
              css={{ ...styles.shareMenuListItem[theme] }}
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
              css={{ ...styles.shareMenuListItem[theme] }}
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
              css={{ ...styles.shareMenuListItem[theme] }}
              href={`https://plus.google.com/share${objectToParams({
                url: url,
              })}`}
              title="Share on Google Plus"
            >
              <FaGooglePlus />
            </a>
            <a
              {...linkAttrs}
              css={{ ...styles.shareMenuListItem[theme] }}
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
  gatsby: {
    background: colors.gatsby,
    textColor: colors.white,
  },
  accent: {
    background: colors.accent,
    textColor: colors.gatsby,
  },
  shareMenuListItem: {
    gatsby: {
      width: 32,
      height: 32,
      marginBottom: space[2],
      "&&": {
        background: colors.gatsby,
        border: 0,
        borderRadius: radii[1],
        color: colors.white,
        display: `flex`,
        alignItems: `center`,
        justifyContent: `center`,
        "&:hover": {
          background: colors.gatsby,
        },
      },
    },
    accent: {
      width: 32,
      height: 32,
      marginBottom: space[2],
      "&&": {
        background: colors.accent,
        border: 0,
        borderRadius: radii[1],
        color: colors.gatsby,
        display: `flex`,
        alignItems: `center`,
        justifyContent: `center`,
      },
    },
  },
}

const linkAttrs = {
  target: `_blank`,
  rel: `noopener noreferrer`,
}
