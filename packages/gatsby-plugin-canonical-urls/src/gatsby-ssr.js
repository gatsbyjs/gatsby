import React from "react"
import url from "url"

exports.onRenderBody = (
  { setHeadComponents, pathname = `/` },
  pluginOptions
) => {
  if (pluginOptions && pluginOptions.siteUrl) {
    const parsedUrl = url.parse(pluginOptions.siteUrl)
    const requireTrailingSlash = pluginOptions.requireTrailingSlash || false
    let myUrl = `${pluginOptions.siteUrl}${pathname}`
    if(requireTrailingSlash) {
      myUrl = myUrl.replace(/\/$|$/, `/`)
    }
    setHeadComponents([
      <link
        rel="canonical"
        key={myUrl}
        href={myUrl}
        data-baseProtocol={parsedUrl.protocol}
        data-baseHost={parsedUrl.host}
        data-requireTrailingSlash={`${requireTrailingSlash}`}
      />,
    ])
  }
}
