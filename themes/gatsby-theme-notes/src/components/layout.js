import React from "react"
import { Global } from "@emotion/core"
import { css, Styled, Layout, Main, Container } from "theme-ui"
import Header from 'gatsby-theme-header'

export default props => (
  <Styled.root>
    <Global
      styles={css({
        body: {
          margin: 0,
          color: `text`,
          bg: `background`,
        },
      })}
    />
    <Layout>
      <Header />
      <Main>
        <Container>{props.children}</Container>
      </Main>
    </Layout>
  </Styled.root>
)
