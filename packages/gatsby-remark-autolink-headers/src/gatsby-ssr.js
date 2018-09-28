import React from "react"

const pluginDefaults = {
  className: `anchor`,
  icon: true,
  offsetY: 0,
}

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  const { className, icon, offsetY } = Object.assign(
    pluginDefaults,
    pluginOptions
  )

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

  const style = icon ? (
    <style key={`gatsby-remark-autolink-headers-style`} type="text/css">
      {styles}
    </style>
  ) : (
    undefined
  )

  return setHeadComponents([
    style,
    <script
      key={`gatsby-remark-autolink-headers-script`}
      dangerouslySetInnerHTML={{ __html: script }}
    />,
  ])
}
