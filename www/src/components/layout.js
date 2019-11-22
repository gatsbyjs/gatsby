/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { navigate, PageRenderer } from "gatsby"
import mousetrap from "mousetrap"
import MdClose from "react-icons/lib/md/close"

import { Global } from "@emotion/core"

import { globalStyles } from "../utils/styles/global"
import {
  colors,
  space,
  zIndices,
  mediaQueries,
} from "../gatsby-plugin-theme-ui"
import { breakpointGutter } from "../utils/styles"
import Banner from "../components/banner"
import withColorMode from "../components/with-color-mode"
import Navigation from "../components/navigation"
import MobileNavigation from "../components/navigation-mobile"
import PageWithSidebar from "../components/page-with-sidebar"
import SiteMetadata from "../components/site-metadata"
import SkipNavLink from "../components/skip-nav-link"
import "../assets/fonts/futura"
import LazyModal from "./modal"

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
    const isDark = this.props.colorMode[0] === `dark`

    if (isModal && window.innerWidth > 750) {
      return (
        <>
          <Global styles={globalStyles} />
          <PageRenderer
            location={{ pathname: this.props.modalBackgroundPath }}
          />
          <LazyModal
            isOpen={true}
            style={{
              content: {
                background: `none`,
                border: `none`,
                bottom: `inherit`,
                left: `inherit`,
                margin: `0 auto`,
                overflow: `visible`,
                padding: `${space[8]} 0`,
                right: `inherit`,
                top: `inherit`,
                maxWidth: `1050px`,
              },
              overlay: {
                backgroundColor: isDark
                  ? colors.modes.dark.modal.overlayBackground
                  : colors.modal.overlayBackground,
                bottom: `unset`,
                left: 0,
                minHeight: `100%`,
                minWidth: `100%`,
                overflowY: `auto`,
                position: `absolute`,
                right: 0,
                top: 0,
                zIndex: zIndices.modal,
              },
            }}
            onRequestClose={() => navigate(this.props.modalBackgroundPath)}
            contentLabel="Site Details Modal"
          >
            <div
              sx={{
                display: `flex`,
                flexWrap: `wrap`,
                justifyContent: `space-between`,
                [mediaQueries.md]: {
                  flexWrap: `nowrap`,
                },
              }}
            >
              <div
                sx={{
                  bg: `card.background`,
                  borderRadius: 2,
                  boxShadow: `dialog`,
                  position: `relative`,
                  alignItems: `center`,
                  order: 1,
                  width: `100%`,
                }}
              >
                <button
                  onClick={this.handleCloseModal}
                  sx={{
                    bg: `card.background`,
                    border: 0,
                    borderRadius: 6,
                    color: `textMuted`,
                    cursor: `pointer`,
                    fontSize: 4,
                    height: 40,
                    left: `auto`,
                    position: `absolute`,
                    right: t => t.space[7],
                    top: t => t.space[8],
                    width: 40,
                    "&:hover": {
                      bg: `ui.hover`,
                      color: `gatsby`,
                    },
                  }}
                >
                  <MdClose />
                </button>
                {this.props.children}
              </div>
              {this.props.modalPreviousLink}
              {this.props.modalNextLink}
            </div>
          </LazyModal>
        </>
      )
    }

    return (
      <>
        <Global styles={globalStyles} />
        <SiteMetadata pathname={this.props.location.pathname} />
        <SkipNavLink />
        <Banner />
        <Navigation pathname={this.props.location.pathname} />
        <div
          className={`main-body docSearch-content`}
          sx={{
            px: `env(safe-area-inset-left)`,
            pt: t => t.sizes.bannerHeight,
            // make room for the mobile navigation
            pb: t => t.sizes.headerHeight,
            [breakpointGutter]: {
              pt: t =>
                `calc(${t.sizes.bannerHeight} + ${t.sizes.headerHeight})`,
              pb: 0,
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

export default withColorMode(DefaultLayout)
