import React from "react"

const {
  defaults,
  imageClass,
  imageBackgroundClass,
  imageWrapperClass,
} = require(`./constants`)

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  const options = Object.assign({}, defaults, pluginOptions)

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

  setHeadComponents([<style type="text/css">{style}</style>])
}
