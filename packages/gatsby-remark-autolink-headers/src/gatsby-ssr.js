import React from "react"

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  let className = `anchor`
  if (pluginOptions.className) {
    className = pluginOptions.className
  }

  let offsetY = 0
  if (pluginOptions.offsetY) {
    offsetY = pluginOptions.offsetY
  }

  const styles = `
    .${className} {
      float: left;
      padding-right: 4px;
      margin-left: -20px;
    }
    h1 .${className} svg,
    h2 .${className} svg,
    h3 .${className} svg,
    h4 .${className} svg,
    h5 .${className} svg,
    h6 .${className} svg {
      visibility: hidden;
    }
    h1:hover .${className} svg,
    h2:hover .${className} svg,
    h3:hover .${className} svg,
    h4:hover .${className} svg,
    h5:hover .${className} svg,
    h6:hover .${className} svg,
    h1 .${className}:focus svg,
    h2 .${className}:focus svg,
    h3 .${className}:focus svg,
    h4 .${className}:focus svg,
    h5 .${className}:focus svg,
    h6 .${className}:focus svg {
      visibility: visible;
    }
  `

  const script = `
    document.addEventListener("DOMContentLoaded", function(event) {
      var hash = window.decodeURI(location.hash.replace('#', ''))
      if (hash !== '') {
        var element = document.getElementById(hash)
        if (element) {
          var offset = element.offsetTop
          // Wait for the browser to finish rendering before scrolling.
          setTimeout((function() {
            window.scrollTo(0, offset - ${offsetY})
          }), 0)
        }
      }
    })
  `

  return setHeadComponents([
    <style key={`gatsby-remark-autolink-headers-style`} type="text/css">
      {styles}
    </style>,
    <script
      key={`gatsby-remark-autolink-headers-script`}
      dangerouslySetInnerHTML={{ __html: script }}
    />,
  ])
}
