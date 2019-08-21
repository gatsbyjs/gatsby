import React from 'react'
import { render } from '@testing-library/react'

import Header from '../header'

describe(`Header`, () => {
  it(`renders siteTitle`, () => {
    const siteTitle = `Hello World`
    const { getByText } = render(<Header siteTitle={siteTitle} />)

    const title = getByText(siteTitle)

    expect(title).toBeInTheDocument()
  })
})
