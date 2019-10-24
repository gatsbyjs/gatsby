/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import Img from "gatsby-image"

import withColorMode from "../components/with-color-mode"

// we need the sizes in src/pages/index already
const itemSize = 64
const gridSize = 32

// we could throw in opacity for all items that don't have an image
// to make things look a bit nicer (calmer) in dark mode
const triangleUp = {
  background: `transparent`,
  borderColor: t => `transparent transparent ${t.colors.ui.border}transparent`,
  borderStyle: `solid`,
  borderWidth: `0 0 ${itemSize}px ${itemSize}px`,
  height: 0,
  width: 0,
}

const triangleDown = {
  ...triangleUp,
  borderColor: t => `transparent transparent transparent ${t.colors.ui.border}`,
  borderWidth: `${itemSize}px 0 0 ${itemSize}px`,
}

class Item extends React.Component {
  render() {
    const { color, x, y, shape, title, scale: s } = this.props.data
    let scale = s === null ? 1 : s

    return (
      <div
        sx={{
          bg: color ? color : `ui.border`,
          borderRadius: shape === `circle` ? `100%` : false,
          boxShadow:
            s === 2 ? `dialog` : shape === `rectangle` ? `raised` : false,
          color: color === `black` ? `white` : false,
          fontSize: 0,
          height: `${itemSize * scale}px`,
          left: `${x * itemSize}px`,
          opacity: this.props.isDark && color && !title ? 0.65 : false,
          overflow: `hidden`,
          position: `absolute`,
          top: `${y * itemSize}px`,
          width:
            shape === `rectangle`
              ? `${itemSize * 2 * scale}px`
              : `${itemSize * scale}px`,
          zIndex: scale === 2 ? 1 : false,
          ...(shape === `triangle-up` ? { ...triangleUp } : {}),
          ...(shape === `triangle-down` ? { ...triangleDown } : {}),
        }}
      >
        {this.props.image &&
          this.props.image.node &&
          this.props.image.node.childScreenshot && (
            <Img
              alt={title}
              fixed={
                this.props.image.node.childScreenshot.screenshotFile
                  .childImageSharp.fixed
              }
              sx={{
                borderRadius: shape === `circle` ? `100%` : false,
                m: 0,
                position: `absolute`,
                maxWidth: `none`,
              }}
            />
          )}
      </div>
    )
  }
}

const getItemImage = (title, showcaseItem) => {
  if (!title) return false
  return showcaseItem.find(showcaseItem => showcaseItem.node.title === title)
}

class Items extends React.Component {
  render() {
    const items = this.props.items
    const showcaseItems = this.props.showcaseItems
    const isDark = this.props.colorMode[0] === `dark`

    return (
      <div
        sx={{
          flexShrink: 1,
          flexGrow: 1,
          backgroundImage: t =>
            `repeating-linear-gradient(transparent, transparent ${gridSize -
              1}px, ${t.colors.ui.border} 20px, ${
              t.colors.ui.border
            } ${gridSize}px), repeating-linear-gradient(0.25turn, transparent, transparent ${gridSize -
              1}px, ${t.colors.ui.border} 20px, ${
              t.colors.ui.border
            } ${gridSize}px)`,
        }}
        ref={r => (this.domNode = r)}
      >
        <div
          sx={{
            position: `relative`,
            width: `100%`,
            height: `100%`,
          }}
        >
          {items.map((item, i) => (
            <Item
              key={i}
              data={item.node}
              image={getItemImage(item.node.title, showcaseItems)}
              isDark={isDark}
            />
          ))}
        </div>
      </div>
    )
  }
}

export default withColorMode(Items)
