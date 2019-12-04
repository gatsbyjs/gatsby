import React from "react"

const { imageClass } = require(`./constants`)

exports.onRenderBody = ({ setHeadComponents }) => {
  const style = `
  .${imageClass} {
    width: 100%;
    height: 100%;
    margin: 0;
    vertical-align: middle;
    position: absolute;
    top: 0;
    left: 0;
    color: transparent;
  }`
    .replace(/\s*\n\s*/g, ``)
    .replace(/: /g, `:`)
    .replace(/ \{/g, `{`)

  setHeadComponents([
    <style type="text/css" key="gatsby-remark-images-styles">
      {style}
    </style>,
  ])
}
