// eslint-disable-next-line
import React from "react"
import { Global } from "@emotion/core"
import { Styled, css } from "theme-ui"

export default props => (
  <Styled.div
    css={css({
      fontFamily: `body`,
      color: `text`,
      bg: `background`,
    })}
  >
    <Global
      styles={{
        "*": {
          boxSizing: `border-box`,
        },
        body: {
          margin: 0,
        },
      }}
    />
    {props.children}
  </Styled.div>
)
