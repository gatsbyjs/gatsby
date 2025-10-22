import React, { Component } from "react"

interface Props {
  /** Description of prop "foo". */
  primitive: number
  /** Description of prop "bar". */
  literalsAndUnion: "string" | "otherstring" | number
  arr: Array<any>
  func?: (value: string) => void
  obj?: { subvalue: boolean }
}

const foo: number = 1 as const
/**
 * General component description.
 */
export default function MyComponent() {
  props: Props

  // ...;
}

export function Foo(props: Props) {
  return <div />
}
