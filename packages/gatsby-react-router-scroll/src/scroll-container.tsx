import React from "react"
import ReactDOM from "react-dom"
import PropTypes from "prop-types"
import { ScrollContext } from "./scroll-handler"
import { SessionStorage } from "./session-storage"
import { Location } from "@reach/router"
import { Location as HLocation } from "history"

const propTypes = {
  scrollKey: PropTypes.string.isRequired,
  shouldUpdateScroll: PropTypes.func,
  children: PropTypes.element.isRequired,
}

type Props = {
  scrollKey: string
  shouldUpdateScroll?: Function
  children: React.ReactNode
}

type PropsWithContextAndLocation = Props & {
  context: SessionStorage
  location: HLocation
}

class ScrollContainerImplementation extends React.Component<
  PropsWithContextAndLocation
> {
  componentDidMount() {
    const node = ReactDOM.findDOMNode(this) as Element
    const { location, scrollKey } = this.props

    if (!node) return

    node.addEventListener("scroll", () => {
      this.props.context.save(location, scrollKey, node.scrollTop)
    })

    const position = this.props.context.read(location, scrollKey)
    node.scrollTo(0, position)
  }

  render() {
    return this.props.children
  }
}

export const ScrollContainer = (props: Props) => (
  <Location>
    {({ location }) => (
      <ScrollContext.Consumer>
        {context => (
          <ScrollContainerImplementation
            {...props}
            context={context}
            location={location}
          />
        )}
      </ScrollContext.Consumer>
    )}
  </Location>
)

ScrollContainer.propTypes = propTypes
