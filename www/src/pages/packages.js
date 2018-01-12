import React, {Component} from "react"
import Container from "../components/container"
import logo from "../gatsby-negative.svg"
import { rhythm } from "../utils/typography"

class Plugins extends Component {
  render(){
    return(
      <Container>
        <div
          css={{
            display: `flex`,
            flexDirection: `column`,
            alignItems: `center`,
            justifyContent: `center`,
            height: `calc(100vh - 300px)`,
          }}
          >
          <img src={logo}
            css={{
              display: `inline-block`,
              height: rhythm(5.2),
              width: rhythm(5.2),
              marginLeft: `auto`,
              marginRight: `auto`,
            }}
            alt=""

          />
          <h1
            css={{
              fontSize: rhythm(1),
              marginTop: rhythm(0.25),
              marginLeft: rhythm(1),
              marginRight: rhythm(1),
              textAlign: `center`,
            }}

            >Welcome to the Gatsby Plugin and Starter Library!</h1>
              <p
                css={{
                  width: rhythm(18),
                  fontSize: rhythm(0.75),
                }}>
                Please use the search bar and filters to find starters
                that will make your blazing-fast site even more awesome.
              </p>
        </div>
      </Container>
    )
  }
}

export default Plugins
