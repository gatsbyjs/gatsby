import React from "react"
import { Link } from "gatsby"
import { useColorMode, css, Styled, Layout, Header, Container } from "theme-ui"
import Toggle from "./toggle"

import Bio from "../components/bio"
import sun from "../../content/assets/sun.png"
import moon from "../../content/assets/moon.png"

const rootPath = `${__PATH_PREFIX__}/`

const Title = props => {
  const { location, title } = props

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
        as="p"
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
  const { location, children } = props
  const [colorMode, setColorMode] = useColorMode()
  const isDark = colorMode === `dark`
  const toggleColorMode = e => {
    setColorMode(isDark ? `light` : `dark`)
  }

  return (
    <Styled.root>
      <Layout>
        <Container
          css={css({
            py: 4,
          })}
        >
          <Header
            css={css({
              display: `block`,
            })}
          >
            <div
              css={css({
                display: `flex`,
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
            </div>
            {location.pathname === rootPath && <Bio />}
          </Header>
          {children}
        </Container>
      </Layout>
    </Styled.root>
  )
}
