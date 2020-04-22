import React from "react"
import PropTypes from "prop-types"
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live"

import * as components from "../../../../../.cache/components"

import "./prism-theme.css"
import "./editor.css"

const editorStyles = {
  backgroundColor: `#f2f2f2`,
  boxSizing: `border-box`,
}

const theme = {
  styles: [
    {
      types: [`comment`, `prolog`, `doctype`, `cdata`],
      styles: {
        color: `#898ea4`,
      },
    },
    {
      types: [`punctuation`],
      styles: {
        color: `#5e6687`,
      },
    },
    {
      types: [`namespace`],
      styles: {
        opacity: 0.7,
      },
    },
    {
      types: [`operator`, `boolean`, `number`],
      styles: {
        color: `#c76b29`,
      },
    },
    {
      types: [`property`],
      styles: {
        color: `#c08b30`,
      },
    },
    {
      types: [`tag`],
      styles: {
        color: `#3d8fd1`,
      },
    },
    {
      types: [`string`],
      styles: {
        color: `#22a2c9`,
      },
    },
    {
      types: [`selector`],
      styles: {
        color: `#6679cc`,
      },
    },
    {
      types: [`attr-name`],
      styles: {
        color: `#c76b29`,
      },
    },
    {
      types: [`entity`, `url`],
      styles: {
        color: `#22a2c9`,
      },
    },
    {
      types: [`attr-value`, `keyword`, `control`, `directive`, `unit`],
      styles: {
        color: `#ac9739`,
      },
    },
    {
      types: [`statement`, `regex`, `atrule`],
      styles: {
        color: `#22a2c9`,
      },
    },
    {
      types: [`placeholder`, `variable`],
      styles: {
        color: `#3d8fd1`,
      },
    },
    {
      types: [`deleted`],
      styles: {
        textDecoration: `line-through`,
      },
    },
    {
      types: [`inserted`],
      styles: {
        borderBottom: `1px dotted #202746`,
        textDecoration: `none`,
      },
    },
    {
      types: [`italic`],
      styles: {
        fontWeight: `italic`,
      },
    },
    {
      types: [`important`, `bold`],
      styles: {
        fontWeight: `bold`,
      },
    },
    {
      types: [`important`],
      styles: {
        color: `#c94922`,
      },
    },
    {
      types: [`entity`],
      styles: {
        cursor: `help`,
      },
    },
  ],
}

class ComponentPreview extends React.Component {
  render() {
    return (
      <LiveProvider
        scope={components}
        code={this.props.code}
        mountStylesheet={false}
        theme={theme}
      >
        <LiveEditor style={editorStyles} />
        <LiveError />
        <LivePreview />
      </LiveProvider>
    )
  }
}

ComponentPreview.propTypes = {
  code: PropTypes.string.isRequired,
}

export default ComponentPreview
