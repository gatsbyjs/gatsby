import * as React from "react"
import VanillaExtractIcon from "../icons/vanilla-extract"
import {
  Container,
  Wrapper,
  Title,
  Button,
  CardBottom,
} from "../styles/index.css"

class IndexPage extends React.Component {
  render() {
    return (
      <div className={Container}>
        <div className={Wrapper}>
          <VanillaExtractIcon />
          <h1 className={Title}>
            Hello World, this is my first component styled with vanilla-extract!
          </h1>
          <div className={CardBottom}>
            <a className={Button} href="https://vanilla-extract.style/">
              vanilla-extract docs
            </a>
          </div>
        </div>
      </div>
    )
  }
}

export default IndexPage
