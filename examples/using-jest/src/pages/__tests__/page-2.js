import React from 'react'
import { render } from 'react-testing-library'
import { StaticQuery } from 'gatsby' // mocked

import PageTwo from '../page-2'

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

describe('Page Two', () => {
  it('contains NOT FOUND text', () => {
    const { getByTestId } = render(<PageTwo />)

    const el = getByTestId('page-2-welcome')

    expect(el).toHaveTextContent('Welcome to page 2')
  })
})
