import * as path from "path"
import * as fs from "fs-extra"
import {
  savePageQueryResult,
  readPageQueryResult,
  waitUntilPageQueryResultsAreStored,
  modifyPageDataForErrorMessage,
  IPageDataWithQueryResult,
} from "../page-data"

describe(`savePageQueryResults / readPageQueryResults`, () => {
  it(`can save and read data`, async () => {
    const fileDir = path.join(process.cwd(), `.cache`, `json`)
    await fs.emptyDir(fileDir)

    const pagePath = `/foo/`
    const inputResult = {
      data: { foo: `bar` },
    }

    await savePageQueryResult(pagePath, JSON.stringify(inputResult))

    await waitUntilPageQueryResultsAreStored()

    const result = await readPageQueryResult(pagePath)
    expect(JSON.parse(result)).toEqual(inputResult)
  })
})

describe(`modifyPageDataForErrorMessage`, () => {
  it(`handles optional data gracefully`, () => {
    const input: IPageDataWithQueryResult = {
      path: `/foo/`,
      componentChunkName: `component`,
      matchPath: `/`,
      slicesMap: {},
      staticQueryHashes: [],
      result: {},
    }
    expect(modifyPageDataForErrorMessage(input)).toMatchInlineSnapshot(`
      Object {
        "errors": Object {},
        "matchPath": "/",
        "path": "/foo/",
        "slicesMap": Object {},
      }
    `)
  })
  it(`outputs expected result shape`, () => {
    const input: IPageDataWithQueryResult = {
      path: `/foo/`,
      componentChunkName: `component`,
      matchPath: `/`,
      slicesMap: {
        foo: `bar`,
      },
      getServerDataError: [
        {
          level: `ERROR`,
          text: `error`,
          stack: [{ fileName: `a` }],
          type: `UNKNOWN`,
        },
      ],
      staticQueryHashes: [`123`],
      result: {
        data: undefined,
        // @ts-ignore - Can ignore for this test
        errors: [`error`],
        extensions: {
          foo: `bar`,
        },
        pageContext: {
          foo: `bar`,
        },
        serverData: {
          foo: `bar`,
        },
      },
    }
    expect(modifyPageDataForErrorMessage(input)).toMatchInlineSnapshot(`
      Object {
        "errors": Object {
          "getServerData": Array [
            Object {
              "level": "ERROR",
              "stack": Array [
                Object {
                  "fileName": "a",
                },
              ],
              "text": "error",
              "type": "UNKNOWN",
            },
          ],
          "graphql": Array [
            "error",
          ],
        },
        "matchPath": "/",
        "pageContext": Object {
          "foo": "bar",
        },
        "path": "/foo/",
        "slicesMap": Object {
          "foo": "bar",
        },
      }
    `)
  })
  it(`doesn't print out the GraphQL result and serverData result`, () => {
    const input: IPageDataWithQueryResult = {
      path: `/foo/`,
      componentChunkName: `component`,
      matchPath: `/`,
      slicesMap: {},
      staticQueryHashes: [],
      result: {
        data: {
          foo: `bar`,
        },
        serverData: {
          foo: `bar`,
        },
      },
    }
    expect(modifyPageDataForErrorMessage(input)).toMatchInlineSnapshot(`
      Object {
        "errors": Object {},
        "matchPath": "/",
        "path": "/foo/",
        "slicesMap": Object {},
      }
    `)
  })
})
