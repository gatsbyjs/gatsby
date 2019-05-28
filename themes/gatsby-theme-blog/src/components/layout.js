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
          fontSize: 4,
        })}
      >
        <Styled.a
          as={Link}
          css={{
            color: `inherit`,
            boxShadow: `none`,
            textDecoration: `none`,
          }}
          to={`/`}
        >
          {title}
        </Styled.a>
      </Styled.h1>
    )
  } else {
    return (
      <Styled.h3
        css={css({
          my: 0,
        })}
      >
        <Styled.a
          as={Link}
          css={css({
            boxShadow: `none`,
            textDecoration: `none`,
            color: `primary`,
          })}
          to={`/`}
        >
          {title}
        </Styled.a>
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
              },
            })(theme)
          }
        />
        <Container
          css={css({
            py: 4,
          })}
        >
          <Header
            css={css({
              justifyContent: `space-between`,
              alignItems: `center`,
              mb: 4,
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
