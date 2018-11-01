import React from 'react'
import { render } from 'react-testing-library'
import { StaticQuery } from 'gatsby' // mocked

import Layout from '../layout'

beforeEach(() => {
  StaticQuery.mockImplementationOnce(({ render }) =>
    render({
      site: {
        siteMetadata: {
          title: 'GatsbyJS',
        },
      },
    })
  )
})

describe('Layout', () => {
  it('renders a header', () => {
    const { container } = render(
      <Layout>
        <h1>Hello</h1>
      </Layout>
    )

    expect(container.querySelector('header')).toBeInTheDocument()
  })

  it('renders children', () => {
    const text = `Hello world`
    const { getByTestId } = render(
      <Layout>
        <h1 data-testid="custom-child">{text}</h1>
      </Layout>
    )

    const child = getByTestId('custom-child')

    expect(child).toHaveTextContent(text)
  })
})
