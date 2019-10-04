import React from "react"
import { navigate, PageRenderer } from "gatsby"
import mousetrap from "mousetrap"
import Modal from "react-modal"
import { SkipNavLink } from "@reach/skip-nav"
import MdClose from "react-icons/lib/md/close"

import {
  colors,
  radii,
  space,
  shadows,
  sizes,
  fontSizes,
  zIndices,
} from "../utils/presets"
import { breakpointGutter } from "../utils/styles"
import Banner from "../components/banner"
import Navigation from "../components/navigation"
import MobileNavigation from "../components/navigation-mobile"
import PageWithSidebar from "../components/page-with-sidebar"
import SiteMetadata from "../components/site-metadata"

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
              css={{
                backgroundColor: colors.white,
                borderRadius: radii[2],
                boxShadow: shadows.dialog,
                position: `relative`,
              }}
            >
              <button
                onClick={this.handleCloseModal}
                css={{
                  background: colors.white,
                  border: 0,
                  borderRadius: radii[6],
                  color: colors.text.secondary,
                  cursor: `pointer`,
                  position: `absolute`,
                  left: `auto`,
                  right: space[7],
                  top: space[8],
                  height: 40,
                  width: 40,
                  fontSize: fontSizes[4],
                  "&:hover": {
                    background: colors.ui.hover,
                    color: colors.gatsby,
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
        </>
      )
    }

    return (
      <>
        <SiteMetadata pathname={this.props.location.pathname} />
        <SkipNavLink css={skipLink}>Skip to main content</SkipNavLink>
        <Banner />
        <Navigation pathname={this.props.location.pathname} />
        <div
          className={`main-body docSearch-content`}
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
