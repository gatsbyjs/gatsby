import React, { ReactChildren } from "react"
import ReactDOM from "react-dom"
import warning from "warning"
import PropTypes from "prop-types"
import {
  ScrollContext,
  IShouldUpdateScroll,
  IHistory,
  ScrollTarget,
} from "./scroll-context"

interface IScrollContainerProps {
  scrollKey: string
  shouldUpdateScroll: IShouldUpdateScroll<IHistory>
  children: ReactChildren
}

interface IScrollContainerContext {
  scrollBehavior: ScrollContext
}

export class ScrollContainer extends React.Component<IScrollContainerProps> {
  static contextTypes = {
    scrollBehavior: PropTypes.object,
  }
  context!: IScrollContainerContext

  scrollKey: string
  domNode: Element | Text | null | undefined

  constructor(props, context) {
    super(props, context)

    // We don't re-register if the scroll key changes, so make sure we
    // unregister with the initial scroll key just in case the user changes it.
    this.scrollKey = props.scrollKey
  }

  componentDidMount(): void {
    this.context.scrollBehavior.registerElement(
      this.props.scrollKey,
      ReactDOM.findDOMNode(this), // eslint-disable-line react/no-find-dom-node
      this.shouldUpdateScroll
    )

    // Only keep around the current DOM node in development, as this is only
    // for emitting the appropriate warning.
    if (process.env.NODE_ENV !== `production`) {
      this.domNode = ReactDOM.findDOMNode(this) // eslint-disable-line react/no-find-dom-node
    }
  }

  componentDidUpdate(prevProps): void {
    warning(
      prevProps.scrollKey === this.props.scrollKey,
      `<ScrollContainer> does not support changing scrollKey.`
    )
    if (process.env.NODE_ENV !== `production`) {
      const prevDomNode = this.domNode
      this.domNode = ReactDOM.findDOMNode(this) // eslint-disable-line react/no-find-dom-node

      warning(
        this.domNode === prevDomNode,
        `<ScrollContainer> does not support changing DOM node.`
      )
    }
  }

  componentWillUnmount(): void {
    this.context.scrollBehavior.unregisterElement(this.scrollKey)
  }

  shouldUpdateScroll = (
    prevRouterProps,
    routerProps
  ): boolean | ScrollTarget => {
    const { shouldUpdateScroll } = this.props
    if (!shouldUpdateScroll) {
      return true
    }

    // Hack to allow accessing scrollBehavior._stateStorage.
    return shouldUpdateScroll.call(
      this.context.scrollBehavior.scrollBehavior,
      prevRouterProps,
      routerProps
    )
  }

  render(): ReactChildren {
    return this.props.children
  }
}
