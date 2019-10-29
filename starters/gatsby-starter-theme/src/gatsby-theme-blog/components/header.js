import React from "react"
import { Link } from "gatsby"
import { css, Styled } from "theme-ui"
import Header from "gatsby-theme-blog/src/components/header"

export default props => (
  <Header {...props}>
    <Styled.a
      as={Link}
      to="/notes"
      css={css({
        ml: 2,
        mr: `auto`,
        fontFamily: `heading`,
        fontWeight: `bold`,
        textDecoration: `none`,
        color: `inherit`,
        ":hover": {
          textDecoration: `underline`,
        },
      })}
    >
      Notes
    </Styled.a>
  </Header>
)
