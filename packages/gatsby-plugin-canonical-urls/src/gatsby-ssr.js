import React from "react"

exports.onRenderBody = (
  { setHeadComponents, pathname = `/` },
  pluginOptions
) => {
  const url = `${pluginOptions.siteUrl}${pathname}`
  setHeadComponents([<link rel="canonical" key={url} href={url} />])
}
