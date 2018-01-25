const { createAllQuery, getNodesFor } = require(`../util`)
const PROPS = require(`./fixtures/all-query.json`)
const toJson = val => JSON.stringify(val, null, 2)

describe(`The util module`, () => {
  const contentType = `Product`

  describe(`createAllQuery`, () => {
    it(`should create a GraphQL query for a content type and a field subquery`, () => {
      const subQuery = `
      id
      slug
      tags
      price
      quantity
    `
      const actual = createAllQuery(contentType, subQuery)
      expect(actual).toMatchSnapshot()
    })

    it(`should create a GraphQL query for the entry ID, if no subQuery is passed `, () => {
      const contentType = `myContentType`
      const actual = createAllQuery(contentType)
      expect(actual).toMatchSnapshot()
    })
  })

  describe(`getNodesFor`, () => {
    it(`should retrieve all entries for a content type from the props`, () => {
      const actual = getNodesFor(contentType)(PROPS)
      expect(toJson(actual)).toMatchSnapshot()
    })
  })
})
