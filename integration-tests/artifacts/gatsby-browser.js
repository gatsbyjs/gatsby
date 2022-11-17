const React = require(`react`)
const { useMoreInfoQuery } = require("./src/hooks/use-more-info-query")
const Github = require(`./src/components/github`).default

// global css import (make sure warm rebuild doesn't invalidate every file when css is imported)
// TODO: Uncomment imported.css to test issue https://github.com/gatsbyjs/gatsby/issues/33450
// require("./imported.css")

import(
  /* webpackChunkName: "magic-comment-app-prefetch", webpackPrefetch: true */ `./src/components/magic-comments/app-prefetch`
).then(moduleForPrefetch => {
  console.log({
    forPrefetch: moduleForPrefetch.forAppPrefetch(),
  })
})

import(
  /* webpackChunkName: "magic-comment-app-preload", webpackPreload: true */ `./src/components/magic-comments/app-preload`
).then(moduleForPreload => {
  console.log({
    forPreload: moduleForPreload.forAppPreload(),
  })
})

exports.wrapRootElement = ({ element }) => {
  return (
    <>
      <Github />
      {element}
    </>
  )
}

function PageWrapper({ children }) {
  const data = useMoreInfoQuery()
  return (
    <>
      <h1>{data.site.siteMetadata.moreInfo}</h1>
      {children}
    </>
  )
}

exports.wrapPageElement = ({ element }) => <PageWrapper>{element}</PageWrapper>
