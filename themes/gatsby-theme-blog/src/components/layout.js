import React from "react"
import { Link } from "gatsby"
import { css, Styled } from "theme-ui"
import Header from './header'

export default props => {
  const { location, children } = props

  return (
    <Styled.root>
      <Header {...props} />
      <div>
        <div
          css={css({
            py: 4,
          })}>
          {children}
        </div>
      </div>
    </Styled.root>
  )
}
