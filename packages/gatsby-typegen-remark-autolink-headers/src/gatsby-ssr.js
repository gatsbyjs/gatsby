import React from 'react'

exports.modifyHeadComponents = (args, pluginOptions) => {
  const styles = `
    .anchor {
      float: left;
      padding-right: 4px;
      margin-left: -20px;
    }
    h1 .anchor svg,
    h2 .anchor svg,
    h3 .anchor svg,
    h4 .anchor svg,
    h5 .anchor svg,
    h6 .anchor svg {
      visibility: hidden;
    }
    h1:hover .anchor svg,
    h2:hover .anchor svg,
    h3:hover .anchor svg,
    h4:hover .anchor svg,
    h5:hover .anchor svg,
    h6:hover .anchor svg {
      visibility: visible;
    }
  `

  const script = `
    document.addEventListener("DOMContentLoaded", function(event) {
      var hash = location.hash.replace('#', '')
      if (hash !== '') {
        var element = document.getElementById(hash)
        if (element) {
          var offset = element.offsetTop
          window.scrollTo(0, offset - ${pluginOptions.offsetY})
        }
      }
    })
  `

  return [
    <style type="text/css">{styles}</style>,
    <script dangerouslySetInnerHTML={{ __html: script }} />,
  ]
}
