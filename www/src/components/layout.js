/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { navigate, PageRenderer } from "gatsby"
import mousetrap from "mousetrap"
import Modal from "react-modal"
import { SkipNavLink } from "@reach/skip-nav"
import MdClose from "react-icons/lib/md/close"
import { Global } from "@emotion/core"
import { global } from "../utils/styles"

import { space, sizes, zIndices } from "../gatsby-plugin-theme-ui"
import { breakpointGutter } from "../utils/styles"
import Banner from "../components/banner"
import Navigation from "../components/navigation"
import MobileNavigation from "../components/navigation-mobile"
import PageWithSidebar from "../components/page-with-sidebar"
import SiteMetadata from "../components/site-metadata"
import DarkThemeStyles from "../components/dark-theme-styles"

// Import Futura PT typeface
import "../assets/fonts/futura"

import { skipLink } from "../utils/styles"

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
        <>
          <Global styles={global} />
          <DarkThemeStyles />
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
                padding: `${space[8]} 0`,
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
                zIndex: zIndices.modal,
                overflowY: `auto`,
                backgroundColor: `rgba(255, 255, 255, 0.95)`,
              },
            }}
            onRequestClose={() => navigate(this.props.modalBackgroundPath)}
            contentLabel="Site Details Modal"
          >
            <div
              sx={{
                backgroundColor: `white`,
                borderRadius: 2,
                boxShadow: `dialog`,
                position: `relative`,
              }}
            >
              <button
                onClick={this.handleCloseModal}
                sx={{
                  bg: `white`,
                  border: 0,
                  borderRadius: 6,
                  color: `text.secondary`,
                  cursor: `pointer`,
                  position: `absolute`,
                  left: `auto`,
                  right: t => t.space[7],
                  top: t => t.space[8],
                  height: 40,
                  width: 40,
                  fontSize: 4,
                  "&:hover": {
                    bg: `ui.hover`,
                    color: `gatsby`,
                  },
                }}
              >
                s
                <MdClose />
              </button>
              {this.props.children}
              {this.props.modalPreviousLink}
              {this.props.modalNextLink}
            </div>
          </Modal>
        </>
      )
    }

    return (
      <>
        <Global styles={global} />
        <DarkThemeStyles />
        <SiteMetadata pathname={this.props.location.pathname} />
        <SkipNavLink css={skipLink}>Skip to main content</SkipNavLink>
        <Banner />
        <Navigation pathname={this.props.location.pathname} />
        <div
          className={`main-body`}
          css={{
            paddingLeft: `env(safe-area-inset-left)`,
            paddingRight: `env(safe-area-inset-right)`,
            paddingTop: sizes.bannerHeight,
            // make room for the mobile navigation
            paddingBottom: sizes.headerHeight,
            [breakpointGutter]: {
              paddingTop: `calc(${sizes.bannerHeight} + ${sizes.headerHeight})`,
              paddingBottom: 0,
            },
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
      </>
    )
  }
}

export default DefaultLayout
