import * as React from "react"

export default function WithoutHead() {
  return (
    <>
      <h1>
        I am used to test cases where we navigate to a page without Head export
      </h1>
      <p data-testid="linked-css-paragraph">
        Just some paragraph to test if linked css properly applies
      </p>
    </>
  )
}
