import React from "react"
import { Link } from "gatsby"
import { LocaleContext } from "./layout"

// Use the globally available context to choose the right path
const LocalizedLink = ({ to, ...props }) => {
  const locale = React.useContext(LocaleContext)

  const isIndex = to === `/`

  // TODO generalize this to other paths
  const isDefault = locale === "en" || !to.startsWith("/tutorial/")
  // If it's the default language, don't do anything
  // If it's another language, add the "path"
  // However, if the homepage/index page is linked don't add the "to"
  // Because otherwise this would add a trailing slash
  const path = isDefault ? to : `${locale}${isIndex ? `` : `${to}`}`
  // const path = locales[locale].default
  //   ? to
  //   : `${locales[locale].path}${isIndex ? `` : `${to}`}`

  return <Link {...props} to={path} />
}

export default LocalizedLink
