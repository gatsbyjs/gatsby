import React from "react"
import { Link } from "gatsby"
import { Global } from "@emotion/core"
import { useColorMode, css, Styled, Layout, Header, Container } from "theme-ui"
import Toggle from "./toggle"

import sun from "../../content/assets/sun.png"
import moon from "../../content/assets/moon.png"

const Title = props => {
  const { location, title } = props
  const rootPath = `${__PATH_PREFIX__}/`

  if (location.pathname === rootPath) {
    return (
      <Styled.h1
        css={css({
          my: 0,
          // ...scale(0.75),
        })}
      >
        <Link
          css={{
            color: `inherit`,
            boxShadow: `none`,
            textDecoration: `none`,
          }}
          to={`/`}
        >
          {title}
        </Link>
      </Styled.h1>
    )
  } else {
    return (
      <Styled.h3
        css={css({
          my: 0,
          // fontFamily: `body`,
          // height: 42, // because
          // lineHeight: `2.625rem`,
        })}
      >
        <Link
          css={css({
            boxShadow: `none`,
            textDecoration: `none`,
            color: `teal`, // color: `rgb(102, 185, 191)`,
          })}
          to={`/`}
        >
          {title}
        </Link>
      </Styled.h3>
    )
  }
}

export default props => {
  const { children } = props
  const [colorMode, setColorMode] = useColorMode()
  const isDark = colorMode === `dark`
  const toggleColorMode = e => {
    setColorMode(isDark ? `light` : `dark`)
  }

  return (
    <Styled.root>
      <Layout>
        <Global
          styles={theme =>
            css({
              body: {
                color: `text`,
                bg: `background`,
                transition: `color 0.2s ease-out, background 0.2s ease-out`,
              },
            })(theme)
          }
        />
        <Container
          css={css({
            py: 2,
          })}
        >
          <Header
            css={css({
              justifyContent: `space-between`,
              alignItems: `center`,
              mb: 3,
            })}
          >
            <Title {...props} />
            <Toggle
              icons={{
                checked: (
                  <img
                    alt="moon indicating dark mode"
                    src={moon}
                    width="16"
                    height="16"
                    role="presentation"
                    css={{ pointerEvents: `none` }}
                  />
                ),
                unchecked: (
                  <img
                    alt="sun indicating light mode"
                    src={sun}
                    width="16"
                    height="16"
                    role="presentation"
                    css={{ pointerEvents: `none` }}
                  />
                ),
              }}
              checked={isDark}
              onChange={toggleColorMode}
            />
          </Header>
          {children}
        </Container>
      </Layout>
    </Styled.root>
  )
}
