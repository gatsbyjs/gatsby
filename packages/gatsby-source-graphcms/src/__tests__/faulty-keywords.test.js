const { GraphQLClient } = require('graphql-request')
const { faultyKeywords, checkForFaultyFields } = require('../faulty-keywords')

const endpoint = 'https://api.graphcms.com/simple/v1/vinylbase'
const client = new GraphQLClient(endpoint)

const faultyQuery = `{
  allArtists {
    records {
      tracks {
        record {
          tracks {
            id
            length
          }
        }
      }
    }
  }
}`

const swellQuery = `{
  allArtists {
    records {
      tracks {
        record {
          tracks {
            id
          }
        }
      }
    }
  }
}`

it('returns true if the query contains a faulty keyword', async () => {
  expect.assertions(1)
  const queryResult = await client.request(faultyQuery)
  expect(checkForFaultyFields(queryResult, faultyKeywords)).toBe(true)
})

it('returns false if the query does not contain any faulty keywords', async () => {
  expect.assertions(1)
  const queryResult = await client.request(swellQuery)
  expect(checkForFaultyFields(queryResult, faultyKeywords)).toBe(false)
})