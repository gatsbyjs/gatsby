import React from "react"
import { Helmet } from "react-helmet"
import styled from "styled-components"
import DynamicComponent from "../components/DynamicComponent"
import "./style.css"

// Create a Title component that'll render an <h1> tag with some styles
const Title = styled.h1`
  font-size: 1.5em;
  text-align: center;
  color: brown;
`

// Create a Wrapper component that'll render a <section> tag with some styles
const Wrapper = styled.section`
  padding: 4em;
  background: papayawhip;
`

class IndexPage extends React.Component {
  handleClick = () => {
    console.log(`Sync-Click!`)
    import(/* webpackChunkName: "async-alert", webpackPrefetch: true */ `../utils/async-alert`).then(
      module => {
        const asyncAlert = module.default
        asyncAlert(`Async-Click!`)
      }
    )
  }

  render() {
    return (
      <React.Fragment>
        <Helmet>
          <title>Gatsby Prefetching/Preloading modules</title>
          <meta
            name="description"
            content="Gatsby example site using prefetching/preloading modules"
          />
          <meta name="referrer" content="origin" />
        </Helmet>
        <div
          style={{
            margin: `0 auto`,
            marginTop: `3rem`,
            padding: `1.5rem`,
            maxWidth: 900,
            color: `red`,
          }}
        >
          <Wrapper>
            <Title>
              Hello World, this is my first prefetching/preloading component!
            </Title>
            <p>
              <button onClick={this.handleClick}>Dynamic Alert!</button>
              <DynamicComponent />
            </p>
          </Wrapper>
        </div>
      </React.Fragment>
    )
  }
}

export default IndexPage
