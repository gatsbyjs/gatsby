import React from "react"
import url from "url"

exports.onRenderBody = (
  { setHeadComponents, pathname = `/` },
  pluginOptions
) => {
  if (pluginOptions && pluginOptions.siteUrl) {
    const siteUrl = pluginOptions.siteUrl.replace(/\/$/, ``)
    const parsed = url.parse(`${siteUrl}${pathname}`)

    let pageUrl = ``

    if (pluginOptions.search !== false) {
      pageUrl = `${parsed.protocol}//${parsed.host}${parsed.pathname}`
    } else {
      pageUrl = parsed.href
    }

    setHeadComponents([
      <link
        rel="canonical"
        key={pageUrl}
        href={pageUrl}
        data-baseprotocol={parsed.protocol}
        data-basehost={parsed.host}
      />,
    ])
  }
}
