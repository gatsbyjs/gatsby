import React from "react"
import { Link } from "gatsby"
import { LocaleContext } from "./layout"
import { localizedPath } from "../utils/i18n"

// Use the globally available context to choose the right path
const LocalizedLink = ({ to, ...props }) => {
  const locale = React.useContext(LocaleContext)

  return <Link {...props} to={localizedPath(locale, to)} />
}

export default LocalizedLink
