/* @flow */

import {
  connectionFromArray,
  connectionFromPromisedArray,
} from "../arrayconnection"

describe(`connectionFromArray()`, () => {
  const letters = [`A`, `B`, `C`, `D`, `E`]

  describe(`basic slicing`, () => {
    it(`returns all elements without filters`, () => {
      const c = connectionFromArray(letters, {})
      return expect(c).toEqual({
        edges: [
          {
            next: `B`,
            node: `A`,
            previous: undefined,
          },
          {
            next: `C`,
            node: `B`,
            previous: `A`,
          },
          {
            next: `D`,
            node: `C`,
            previous: `B`,
          },
          {
            next: `E`,
            node: `D`,
            previous: `C`,
          },
          {
            next: undefined,
            node: `E`,
            previous: `D`,
          },
        ],
        pageInfo: {
          hasNextPage: false,
        },
      })
    })

    it(`respects a smaller first`, () => {
      const c = connectionFromArray(letters, { limit: 2 })
      return expect(c).toEqual({
        edges: [
          {
            node: `A`,
            next: `B`,
            previous: undefined,
          },
          {
            node: `B`,
            next: `C`,
            previous: `A`,
          },
        ],
        pageInfo: {
          hasNextPage: true,
        },
      })
    })

    it(`respects an overly large first`, () => {
      const c = connectionFromArray(letters, { limit: 10 })
      return expect(c).toEqual({
        edges: [
          {
            next: `B`,
            node: `A`,
            previous: undefined,
          },
          {
            next: `C`,
            node: `B`,
            previous: `A`,
          },
          {
            next: `D`,
            node: `C`,
            previous: `B`,
          },
          {
            next: `E`,
            node: `D`,
            previous: `C`,
          },
          {
            next: undefined,
            node: `E`,
            previous: `D`,
          },
        ],
        pageInfo: {
          hasNextPage: false,
        },
      })
    })
  })

  describe(`pagination`, () => {
    it(`respects limit and skip`, () => {
      const c = connectionFromArray(letters, { limit: 2, skip: 2 })
      return expect(c).toEqual({
        edges: [
          {
            next: `D`,
            node: `C`,
            previous: `B`,
          },
          {
            next: `E`,
            node: `D`,
            previous: `C`,
          },
        ],
        pageInfo: {
          hasNextPage: true,
        },
      })
    })

    it(`respects limit and skip with large skip`, () => {
      const c = connectionFromArray(letters, { limit: 10, skip: 2 })
      return expect(c).toEqual({
        edges: [
          {
            next: `D`,
            node: `C`,
            previous: `B`,
          },
          {
            next: `E`,
            node: `D`,
            previous: `C`,
          },
          {
            next: undefined,
            node: `E`,
            previous: `D`,
          },
        ],
        pageInfo: {
          hasNextPage: false,
        },
      })
    })
  })
})

describe(`connectionFromPromisedArray()`, () => {
  const letters = Promise.resolve([`A`, `B`, `C`, `D`, `E`])

  it(`returns all elements without filters`, async () => {
    const c = await connectionFromPromisedArray(letters, {})
    return expect(c).toEqual({
      edges: [
        {
          next: `B`,
          node: `A`,
          previous: undefined,
        },
        {
          next: `C`,
          node: `B`,
          previous: `A`,
        },
        {
          next: `D`,
          node: `C`,
          previous: `B`,
        },
        {
          next: `E`,
          node: `D`,
          previous: `C`,
        },
        {
          next: undefined,
          node: `E`,
          previous: `D`,
        },
      ],
      pageInfo: {
        hasNextPage: false,
      },
    })
  })

  it(`respects a smaller first`, async () => {
    const c = await connectionFromPromisedArray(letters, { limit: 2 })
    return expect(c).toEqual({
      edges: [
        {
          next: `B`,
          node: `A`,
          previous: undefined,
        },
        {
          next: `C`,
          node: `B`,
          previous: `A`,
        },
      ],
      pageInfo: {
        hasNextPage: true,
      },
    })
  })
})
