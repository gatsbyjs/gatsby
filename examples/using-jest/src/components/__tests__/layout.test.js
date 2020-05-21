import * as React from "react"
import { render } from "@testing-library/react"
import { StaticQuery } from "gatsby" // mocked

import Layout from "../layout"

beforeEach(() => {
  StaticQuery.mockImplementationOnce(({ render }) =>
    render({
      site: {
        siteMetadata: {
          title: `GatsbyJS`,
        },
      },
    })
  )
})

describe(`Layout`, () => {
  it(`renders a header`, () => {
    const { container } = render(
      <Layout>
        <main>
          <h1>hello</h1>
        </main>
      </Layout>
    )

    expect(container.querySelector(`header`)).toBeInTheDocument()
  })

  it(`renders children`, () => {
    const text = `__Hello world__`
    const { getByText } = render(
      <Layout>
        <main>
          <h1>{text}</h1>
        </main>
      </Layout>
    )

    const child = getByText(text)

    expect(child).toBeInTheDocument()
  })
})
