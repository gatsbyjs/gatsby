import React, { Fragment } from "react"
import MdShare from "react-icons/lib/md/share"
import FaPinterestP from "react-icons/lib/fa/pinterest-p"
import FaGooglePlus from "react-icons/lib/fa/google-plus"
import FaLinkedin from "react-icons/lib/fa/linkedin"
import FaFacebook from "react-icons/lib/fa/facebook"
import FaTwitter from "react-icons/lib/fa/twitter"

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
          sx={{
            background: styles[theme].background,
            border: 0,
            borderRadius: 1,
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
              sx={styles.shareMenuListItem[theme]}
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
              sx={styles.shareMenuListItem[theme]}
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
              sx={styles.shareMenuListItem[theme]}
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
              sx={styles.shareMenuListItem[theme]}
              href={`https://plus.google.com/share${objectToParams({
                url: url,
              })}`}
              title="Share on Google Plus"
            >
              <FaGooglePlus />
            </a>
            <a
              {...linkAttrs}
              sx={styles.shareMenuListItem[theme]}
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
    background: `gatsby`,
    textColor: `white`,
  },
  accent: {
    background: `accent`,
    textColor: `gatsby`,
  },
  shareMenuListItem: {
    gatsby: {
      width: 32,
      height: 32,
      mb: 2,
      "&&": {
        background: `gatsby`,
        border: 0,
        borderRadius: 1,
        color: `white`,
        display: `flex`,
        alignItems: `center`,
        justifyContent: `center`,
        "&:hover": {
          background: `gatsby`,
        },
      },
    },
    accent: {
      width: 32,
      height: 32,
      mb: 2,
      "&&": {
        background: `accent`,
        border: 0,
        borderRadius: 1,
        color: `gatsby`,
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
