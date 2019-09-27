import React from "react"

export const onPreRenderHTML = ({
  getHeadComponents,
  pathname,
  replaceHeadComponents,
}) => {
  if (pathname !== `/offline-plugin-app-shell-fallback/`) return

  const headComponents = getHeadComponents()

  const filteredHeadComponents = headComponents.filter(
    ({ type, props }) =>
      !(
        type === `link` &&
        props.as === `fetch` &&
        props.rel === `preload` &&
        (props.href.startsWith(`/static/d/`) ||
          props.href.startsWith(`/page-data/`))
      )
  )

  replaceHeadComponents(filteredHeadComponents)
}

export const onRenderBody = ({ pathname, setHeadComponents }) => {
  if (pathname !== `/offline-plugin-app-shell-fallback/`) {
    return
  }

  setHeadComponents([
    <noscript key="disable-offline-shell">
      <link
        rel="preload"
        as="fetch"
        href="/.gatsby-plugin-offline:disableOfflineShell"
      />
      <meta httpEquiv="refresh" content="0;url=" />
    </noscript>,
  ])
}
