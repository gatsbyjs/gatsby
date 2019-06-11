import React from "react"
import { Link } from "gatsby"
import { Global } from "@emotion/core"
import { css, Styled, Layout, Main, Container } from "theme-ui"
import Header from 'gatsby-theme-header'

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
