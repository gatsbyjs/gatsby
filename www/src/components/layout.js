import React from "react"
import Modal from "react-modal"
import { SkipNavLink } from "@reach/skip-nav"
import { OutboundLink } from "gatsby-plugin-google-analytics"
import MdClose from "react-icons/lib/md/close"
import { navigate, PageRenderer } from "gatsby"
import presets, { colors } from "../utils/presets"
import Banner from "../components/banner"
import Navigation from "../components/navigation"
import MobileNavigation from "../components/navigation-mobile"
import PageWithSidebar from "../components/page-with-sidebar"
import SiteMetadata from "../components/site-metadata"

import mousetrap from "mousetrap"

// Import Futura PT typeface
import "../fonts/Webfonts/futurapt_book_macroman/stylesheet.css"
import "../fonts/Webfonts/futurapt_bookitalic_macroman/stylesheet.css"
import "../fonts/Webfonts/futurapt_demi_macroman/stylesheet.css"
import "../fonts/Webfonts/futurapt_demiitalic_macroman/stylesheet.css"

// Other fonts
import "typeface-spectral"

let windowWidth

class DefaultLayout extends React.Component {
  constructor() {
    super()
    this.handleCloseModal = this.handleCloseModal.bind(this)
  }

  handleCloseModal() {
    navigate(this.props.modalBackgroundPath)
  }

  componentDidMount() {
    Modal.setAppElement(`#___gatsby`)

    if (this.props.isModal && window.innerWidth > 750) {
      mousetrap.bind(`left`, this.props.modalPrevious)
      mousetrap.bind(`right`, this.props.modalNext)
      mousetrap.bind(`spacebar`, this.props.modalNext)

      document.querySelector(`html`).style.overflowY = `hidden`
    }
  }

  componentWillUnmount() {
    if (this.props.isModal && window.innerWidth > 750) {
      mousetrap.unbind(`left`)
      mousetrap.unbind(`right`)
      mousetrap.unbind(`spacebar`)

      document.querySelector(`html`).style.overflowY = `auto`
    }
  }

  render() {
    const isHomepage = this.props.location.pathname === `/`

    // SEE: template-docs-markdown for why this.props.isSidebarDisabled is here
    const isSidebarDisabled =
      this.props.isSidebarDisabled || !this.props.itemList
    let isModal = false
    if (!windowWidth && typeof window !== `undefined`) {
      windowWidth = window.innerWidth
    }
    if (this.props.isModal && windowWidth > 750) {
      isModal = true
    }

    if (isModal && window.innerWidth > 750) {
      return (
        <React.Fragment>
          <PageRenderer
            location={{ pathname: this.props.modalBackgroundPath }}
          />
          <Modal
            isOpen={true}
            style={{
              content: {
                top: `inherit`,
                left: `inherit`,
                right: `inherit`,
                bottom: `inherit`,
                margin: `0 auto`,
                width: `750px`,
                background: `none`,
                border: `none`,
                padding: `40px 0`,
                overflow: `visible`,
              },
              overlay: {
                position: `absolute`,
                top: 0,
                left: 0,
                right: 0,
                bottom: `unset`,
                minHeight: `100%`,
                minWidth: `100%`,
                zIndex: 10,
                overflowY: `auto`,
                backgroundColor: `rgba(255, 255, 255, 0.95)`,
              },
            }}
            onRequestClose={() => navigate(this.props.modalBackgroundPath)}
            contentLabel="Site Details Modal"
          >
            <div
              css={{
                backgroundColor: `#ffffff`,
                borderRadius: presets.radius,
                boxShadow: `0 0 90px -24px ${colors.gatsby}`,
                position: `relative`,
              }}
            >
              <button
                onClick={this.handleCloseModal}
                css={{
                  background: colors.ui.bright,
                  border: 0,
                  borderBottomLeftRadius: presets.radius,
                  borderTopRightRadius: presets.radius,
                  color: colors.gatsby,
                  cursor: `pointer`,
                  position: `absolute`,
                  left: `auto`,
                  right: 0,
                  height: 40,
                  width: 40,
                  "&:hover": {
                    background: colors.gatsby,
                    color: `#fff`,
                  },
                }}
              >
                <MdClose />
              </button>
              {this.props.children}
              {this.props.modalPreviousLink}
              {this.props.modalNextLink}
            </div>
          </Modal>
        </React.Fragment>
      )
    }

    return (
      <div className={isHomepage ? `is-homepage` : ``}>
        <SiteMetadata pathname={this.props.location.pathname} />
        <SkipNavLink css={styles.skipLink}>Skip to main content</SkipNavLink>
        <Banner background={isHomepage ? `#402060` : false}>
          {/* !!! If you change the children of Banner remember to do the same in layout/layout-with-heading.js */}
          <OutboundLink
            href="https://www.gatsbyjs.com/content-mesh-contentful"
            css={{
              color: `#fff`,
              "&:hover": {
                color: `#fff`,
              },
            }}
          >
            Watch
          </OutboundLink>
          {`: “Rise of the Content Mesh: Webcast with Contentful and Gatsby”.`}
        </Banner>
        <Navigation pathname={this.props.location.pathname} />
        <div
          className={`main-body`}
          css={{
            paddingTop: presets.bannerHeight,
            [presets.Tablet]: {
              margin: `0 auto`,
              paddingTop: isHomepage
                ? presets.bannerHeight
                : `calc(${presets.bannerHeight} + ${presets.headerHeight})`,
            },
            paddingLeft: `env(safe-area-inset-left)`,
            paddingRight: `env(safe-area-inset-right)`,
          }}
        >
          <PageWithSidebar
            disable={isSidebarDisabled}
            itemList={this.props.itemList}
            location={this.props.location}
            enableScrollSync={this.props.enableScrollSync}
            renderContent={() => this.props.children}
          />
        </div>
        <MobileNavigation />
      </div>
    )
  }
}

const styles = {
  skipLink: {
    border: `0`,
    clip: `rect(0 0 0 0)`,
    height: 1,
    width: 1,
    margin: -1,
    padding: 0,
    overflow: `hidden`,
    position: `absolute`,
    zIndex: 100,
    fontSize: `0.85rem`,
    ":focus": {
      padding: `0.9rem`,
      position: `fixed`,
      top: 10,
      left: 10,
      background: `white`,
      textDecoration: `none`,
      width: `auto`,
      height: `auto`,
      clip: `auto`,
    },
  },
}

export default DefaultLayout
