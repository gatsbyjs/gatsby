const { parse } = require(`gatsby/graphql`)
const { execute } = require(`@apollo/client`)
const { createDataloaderLink } = require(`../dataloader-link`)

const sampleQuery = parse(`{ foo }`)
const expectedSampleQueryResult = { data: { foo: `bar` } }

const fetchResult = { data: { gatsby0_foo: `bar` } }

const makeFetch = (expectedResult = fetchResult) =>
  jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(expectedResult),
    })
  )

describe(`createDataloaderLink`, () => {
  it(`works with minimal set of options`, done => {
    const link = createDataloaderLink({
      uri: `some-endpoint`,
      fetch: makeFetch(),
    })
    const observable = execute(link, { query: sampleQuery })
    observable.subscribe({
      next: result => {
        expect(result).toEqual(expectedSampleQueryResult)
        done()
      },
      error: done,
    })
  })

  it(`reports fetch errors`, done => {
    const link = createDataloaderLink({
      uri: `some-endpoint`,
      fetch: jest.fn(() => Promise.reject(`FetchError`)),
    })
    const observable = execute(link, { query: sampleQuery })
    observable.subscribe({
      error: error => {
        expect(error).toEqual(`FetchError`)
        done()
      },
      complete: () => {
        done.fail(`Expected error not thrown`)
      },
    })
  })

  it(`reports graphql errors`, done => {
    const result = {
      errors: [{ message: `Error1` }, { message: `Error2`, path: [`foo`] }],
    }
    const link = createDataloaderLink({
      uri: `some-endpoint`,
      fetch: makeFetch(result),
    })
    const observable = execute(link, { query: sampleQuery })
    observable.subscribe({
      error: error => {
        expect(error.name).toEqual(`GraphQLError`)
        expect(error.message).toEqual(
          `Failed to load query batch:\nError1\nError2 (path: ["foo"])`
        )
        expect(error.originalResult).toEqual(result)
        done()
      },
      complete: () => {
        done.fail(`Expected error not thrown`)
      },
    })
  })

  it(`supports custom fetch options`, done => {
    const fetch = makeFetch()
    const fetchOptions = {
      credentials: `include`,
      mode: `cors`,
    }
    const link = createDataloaderLink({
      uri: `some-endpoint`,
      fetch,
      fetchOptions,
    })

    const observable = execute(link, { query: sampleQuery })
    const next = jest.fn()

    observable.subscribe({
      next,
      error: done,
      complete: () => {
        expect(fetch.mock.calls.length).toEqual(1)
        const [uri, options] = fetch.mock.calls[0]
        expect(uri).toEqual(`some-endpoint`)
        expect(options).toEqual(expect.objectContaining(fetchOptions))
        done()
      },
    })
  })
})
