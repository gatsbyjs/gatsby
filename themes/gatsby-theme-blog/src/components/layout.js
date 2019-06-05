import React from "react"
import { Link } from "gatsby"
import { Global } from "@emotion/core"
import { useColorMode, css, Styled, Layout, Container } from "theme-ui"
import Header from 'gatsby-theme-header'

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
        <Header />
        <Container
          css={css({
            py: 4,
          })}>
          {children}
        </Container>
      </Layout>
    </Styled.root>
  )
}
