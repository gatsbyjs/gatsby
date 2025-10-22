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
  /**
   * Bad Documented
   * @memberof Props
   */
  badDocumented: ReactNode,
}

/**
 * General component description.
 */
export default function MyComponent() {
  props: Props

  // ...;
}
