import Link, {
  withPrefix,
  withAssetPrefix,
  navigate,
  push,
  replace,
  navigateTo,
  parsePath,
} from "gatsby-link"
import { useScrollRestoration } from "gatsby-react-router-scroll"
import PageRenderer from "./public-page-renderer"
import loader from "./loader"
import { Head } from "./head"
import { StaticQuery, StaticQueryContext, useStaticQuery } from "./static-query"

const prefetchPathname = loader.enqueue

function graphql() {
  throw new Error(
    `It appears like Gatsby is misconfigured. Gatsby related \`graphql\` calls ` +
      `are supposed to only be evaluated at compile time, and then compiled away. ` +
      `Unfortunately, something went wrong and the query was left in the compiled code.\n\n` +
      `Unless your site has a complex or custom babel/Gatsby configuration this is likely a bug in Gatsby.`
  )
}

export {
  Link,
  withAssetPrefix,
  withPrefix,
  graphql,
  parsePath,
  navigate,
  push, // TODO replace for v3
  replace, // TODO remove replace for v3
  navigateTo, // TODO: remove navigateTo for v3
  useScrollRestoration,
  StaticQueryContext,
  StaticQuery,
  PageRenderer,
  useStaticQuery,
  prefetchPathname,
  Head,
}
