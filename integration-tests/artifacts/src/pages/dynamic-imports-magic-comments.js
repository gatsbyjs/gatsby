import * as React from "react"

import(
  /* webpackChunkName: "magic-comment-prefetch", webpackPrefetch: true */ `../components/magic-comments/prefetch`
).then(moduleForPrefetch => {
  console.log({ forPrefetch: moduleForPrefetch.forPrefetch() })
})

import(
  /* webpackChunkName: "magic-comment-preload", webpackPreload: true */ `../components/magic-comments/preload`
).then(moduleForPreload => {
  console.log({ forPreload: moduleForPreload.forPreload() })
})

export default function DynamicImportsWithWebpackMagicComments() {
  return <div>Sample for dynamic imports with webpack's magic comments</div>
}
