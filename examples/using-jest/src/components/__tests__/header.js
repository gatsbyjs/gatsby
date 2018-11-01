import React from 'react'
import { render } from 'react-testing-library'

import Header from '../header'

describe('Header', () => {
  it('renders siteTitle', () => {
    const siteTitle = 'Hello World'
    const { getByTestId } = render(<Header siteTitle={siteTitle} />)

    const title = getByTestId('title')

    console.log(title.innerHTML)

    expect(title).toHaveTextContent(siteTitle)
  })
})
