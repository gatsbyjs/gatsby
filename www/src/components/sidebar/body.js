import React from "react"

import Section from "./section"
import presets, { colors } from "../../utils/presets"
import { options, rhythm, scale } from "../../utils/typography"

class SidebarBody extends React.Component {
  constructor(props, context) {
    super(props, context)

    let state = {
      openSectionHash: {},
    }

    if (props.sectionList.length === 1) {
      state.openSectionHash[props.sectionList.title] = true
    } else {
      props.sectionList.forEach(child => {
        state.openSectionHash[child.title] =
          props.defaultActiveSection.title === child.title ? true : false
      })
    }

    this.state = state
  }

  _toggleSection(section) {
    const { openSectionHash } = this.state
    this.setState({
      openSectionHash: {
        ...openSectionHash,
        [section.title]: !openSectionHash[section.title],
      },
    })
  }

  _expandAll = () => {
    let openSectionHash = { ...this.state.openSectionHash }
    Object.keys(openSectionHash).forEach(k => (openSectionHash[k] = true))
    this.setState({ openSectionHash })
  }

  render() {
    const {
      createLink,
      location,
      sectionList,
      closeParentMenu,
      enableScrollSync,
      activeItemHash,
    } = this.props
    let { openSectionHash } = this.state
    const singleSection = sectionList.length === 1

    return (
      <div className="docSearch-sidebar">
        {sectionList.length > 1 && (
          <div
            css={{
              display: `none`,
              marginLeft: rhythm(1),
              marginRight: rhythm(1),
              textAlign: `right`,
              // [presets.Tablet]: {
              //   display: `block`,
              // },
            }}
          >
            <button
              onClick={this._expandAll}
              css={{
                ...scale(-2 / 3),
                background: `transparent`,
                border: `1px solid ${colors.ui.bright}`,
                borderRadius: presets.radius,
                color: colors.gatsby,
                fontFamily: options.systemFontFamily.join(`,`),
              }}
            >
              Expand All
            </button>
          </div>
        )}
        {sectionList.map((section, index) => (
          <Section
            createLink={createLink}
            isActive={openSectionHash[section.title] || singleSection}
            key={index}
            name={section.title}
            location={location}
            onLinkClick={closeParentMenu}
            onSectionTitleClick={() => this._toggleSection(section)}
            section={section}
            hideSectionTitle={singleSection}
            activeItemHash={activeItemHash}
            isScrollSync={enableScrollSync}
          />
        ))}
      </div>
    )
  }
}

export default SidebarBody
