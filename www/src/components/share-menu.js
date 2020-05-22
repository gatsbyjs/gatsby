/** @jsx jsx */
import { jsx } from "theme-ui"
import React, { Fragment } from "react"
import { MdShare } from "react-icons/md"
import { FaPinterestP, FaLinkedin, FaFacebook, FaTwitter } from "react-icons/fa"

const objectToParams = object =>
  `?` +
  Object.keys(object)
    .filter(key => !!object[key])
    .map(key => `${key}=${encodeURIComponent(object[key])}`)
    .join(`&`)

const ShareMenuItem = ({ href, title, children }) => (
  <a
    target="_blank"
    rel="noopener noreferrer"
    sx={{
      width: 36,
      height: 36,
      mb: 2,
      "&&": {
        bg: `button.primaryBg`,
        border: 0,
        borderRadius: 2,
        color: `button.primaryText`,
        display: `flex`,
        alignItems: `center`,
        justifyContent: `center`,
      },
    }}
    href={href}
    title={title}
  >
    {children}
  </a>
)

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
    const { url, title, image, className } = this.props
    const { open } = this.state
    return (
      <Fragment>
        <button
          onClick={this.shareMenu}
          sx={{
            bg: `button.primaryBg`,
            border: 0,
            borderRadius: 2,
            color: `button.primaryText`,
            cursor: `pointer`,
            height: 36,
            width: 36,
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
            <ShareMenuItem
              href={`https://pinterest.com/pin/create/button/${objectToParams({
                url: url,
                media: image,
                description: title,
              })}`}
              title="Share on Pinterest"
            >
              <FaPinterestP />
            </ShareMenuItem>
            <ShareMenuItem
              href={`https://www.linkedin.com/shareArticle${objectToParams({
                mini: `true`,
                url: url,
                title: title,
              })}`}
              title="Share on LinkedIn"
            >
              <FaLinkedin />
            </ShareMenuItem>
            <ShareMenuItem
              href={`https://www.facebook.com/sharer.php${objectToParams({
                u: url,
                t: title,
              })}`}
              title="Share on Facebook"
            >
              <FaFacebook />
            </ShareMenuItem>
            <ShareMenuItem
              href={`https://twitter.com/share${objectToParams({
                url: url,
                text: title,
              })}`}
              title="Share on Twitter"
            >
              <FaTwitter />
            </ShareMenuItem>
          </div>
        )}
      </Fragment>
    )
  }
}

export default ShareMenu
