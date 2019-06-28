import React from "react"
import { css, Styled } from "theme-ui"
import Header from "./header"

export default props => (
  <Styled.root>
    <Header {...props} />
    <div>
      <div
        css={css({
          variant: `styles.Container`,
          mx: `auto`,
          py: 4,
        })}
      >
        {props.children}
      </div>
    </div>
  </Styled.root>
)
