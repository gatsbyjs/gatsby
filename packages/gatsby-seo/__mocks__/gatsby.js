import React from 'react'

const graphql = jest.fn()
const StaticQueryMock = ({ render }) => {
  return render(graphql())
}
const StaticQuery = jest.fn().mockImplementation(StaticQueryMock)

export { graphql, StaticQuery }
