import React from "react"
import { css, Styled } from "theme-ui"
import Header from "./header"
import useBlogThemeConfig from "../hooks/configOptions"

export default ({ children, ...props }) => {
  const blogThemeConfig = useBlogThemeConfig()
  const { webfontURL } = blogThemeConfig

  return (
    <Styled.root>
      <head>
        <link rel="stylesheet" href={webfontURL} />
      </head>
      <Header {...props} />
      <div>
        <div
          css={css({
            maxWidth: `container`,
            mx: `auto`,
            px: 3,
            py: 4,
          })}
        >
          {children}
        </div>
      </div>
    </Styled.root>
  )
}
