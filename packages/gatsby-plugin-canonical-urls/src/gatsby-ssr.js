import React from "react"
import url from "url"

exports.onRenderBody = (
  { setHeadComponents, pathname = `/` },
  pluginOptions
) => {
  if (pluginOptions && pluginOptions.siteUrl) {
    const parsedUrl = url.parse(pluginOptions.siteUrl)
    const myUrl = `${pluginOptions.siteUrl}${pathname}`
    setHeadComponents([
      <link
        rel="canonical"
        key={myUrl}
        href={myUrl}
        data-baseprotocol={parsedUrl.protocol}
        data-basehost={parsedUrl.host}
      />,
    ])
  }
}
