import React from 'react'
import { renderToString } from 'react-dom/server'
import { renderStaticOptimized } from 'glamor/server'

exports.replaceServerBodyRender = ({ component, headComponents }) => {
  const { html, ...props } = renderStaticOptimized(() =>
    renderToString(component))

  headComponents.push(
    <style
      id="glamor-styles"
      dangerouslySetInnerHTML={{ __html: props.css }}
    />
  )

  return { headComponents, body: html, ...props }
}
