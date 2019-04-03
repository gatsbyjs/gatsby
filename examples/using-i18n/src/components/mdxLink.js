import React from "react"
import LocalizedLink from "./localizedLink"

const isHash = str => /^#/.test(str)
const isInternal = to => /^\/(?!\/)/.test(to)

// Only use <LocalizedLink /> for internal links
const MdxLink = ({ href, ...props }) =>
  isHash(href) || !isInternal(href) ? (
    <a {...props} href={href} />
  ) : (
    <LocalizedLink {...props} to={href} />
  )

export default MdxLink
