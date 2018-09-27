// @flow
import React, { Component } from "react"

type Props = {
  /** Description of prop "foo". */
  primitive: number,
  /** Description of prop "bar". */
  literalsAndUnion: "string" | "otherstring" | number,
  arr: Array<any>,
  func?: (value: string) => void,
  obj?: { subvalue: ?boolean },
}

/**
 * General component description.
 */
export default class MyComponent extends Component<void, Props, void> {
  props: Props

  render(): ?ReactElement {
    // ...
  }
}
