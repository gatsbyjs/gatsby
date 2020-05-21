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

interface IProps {
  scrollKey: string
  shouldUpdateScroll?: Function
  children: React.ReactNode
}

interface IPropsWithContextAndLocation extends IProps {
  context: SessionStorage
  location: HLocation
}

class ScrollContainerImplementation extends React.Component<
  IPropsWithContextAndLocation
> {
  componentDidMount(): void {
    // eslint-disable-next-line react/no-find-dom-node
    const node = ReactDOM.findDOMNode(this) as Element
    const { location, scrollKey } = this.props

    if (!node) return

    node.addEventListener(`scroll`, () => {
      this.props.context.save(location, scrollKey, node.scrollTop)
    })

    const position = this.props.context.read(location, scrollKey)
    node.scrollTo(0, position)
  }

  render(): React.ReactNode {
    return this.props.children
  }
}

export const ScrollContainer = (props: IProps): React.ReactNode => (
  <Location>
    {({ location }): React.ReactNode => (
      <ScrollContext.Consumer>
        {(context): React.ReactNode => (
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
