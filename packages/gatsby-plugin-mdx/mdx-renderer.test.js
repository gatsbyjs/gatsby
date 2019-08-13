import React from "react"
import TestRenderer from "react-test-renderer"

import MDXRenderer from "./mdx-renderer"

describe(`mdx-renderer`, () => {
  test(`renders React elements when scope is provided`, () => {
    const result = TestRenderer.create(
      <MDXRenderer
        scope={{ React: React }}
      >{`return () => React.createElement('div')`}</MDXRenderer>
    )

    expect(result.toJSON()).toEqual({ type: `div`, props: {}, children: null })
  })

  test(`provides a useful error message when no mdx is passed`, () => {
    const expectedErrorMessage = `MDXRenderer expected to receive an MDX String in children. Instead, it received: undefined`

    const renderUndefined = () => {
      TestRenderer.create(<MDXRenderer scope={{ React: React }} />)
    }

    expect(renderUndefined).toThrowError(expectedErrorMessage)
  })
})
