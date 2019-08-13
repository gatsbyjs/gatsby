import React from "react"
import { Link } from "gatsby"
import { Styled, css } from "theme-ui"

import useOptions from "../use-options"
import BreadcrumbDivider from "./breadcrumb-divider"
import BreadcrumbHome from "./breadcrumb-home"

export default ({ links }) => {
  const { basePath = `/`, homeText, breadcrumbSeparator } = useOptions()
  const baseBreadcrumbText = basePath.replace(/^\//, ``)

  return (
    <nav
      css={css({
        mb: 3,
        "& a": {
          textDecoration: `none`,
          fontWeight: `bold`,
        },
      })}
    >
      <BreadcrumbHome text={homeText} />
      <BreadcrumbDivider text={breadcrumbSeparator} />

      <Styled.a as={Link} to={basePath}>
        {baseBreadcrumbText}
      </Styled.a>
      {links.map(link => (
        <>
          {baseBreadcrumbText.length ? (
            <BreadcrumbDivider text={breadcrumbSeparator} />
          ) : null}
          <Styled.a as={Link} to={link.url} key={link.url}>
            {link.name}
          </Styled.a>
        </>
      ))}
    </nav>
  )
}
