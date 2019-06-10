import React from "react"
import { Link } from "gatsby"
import { Global } from "@emotion/core"
import { css, Styled, Layout, Main, Container } from "theme-ui"
import Header from 'gatsby-theme-header'

// container 672
// px 28

// notes
// container 769
// padding 56

export default props => {
  const { children } = props

  return (
    <Styled.root>
      <Layout>
        <Global
          styles={theme =>
            css({
              body: {
                margin: 0,
                color: `text`,
                bg: `background`,
              },
            })(theme)
          }
        />
        <Header />
        <Main>
          <Container
            css={css({
              py: 4,
            })}>
            {children}
          </Container>
        </Main>
      </Layout>
    </Styled.root>
  )
}
