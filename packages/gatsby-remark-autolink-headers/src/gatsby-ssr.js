import React from "react"

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  let offsetY = 0
  if (pluginOptions.offsetY) {
    offsetY = pluginOptions.offsetY
  }

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
