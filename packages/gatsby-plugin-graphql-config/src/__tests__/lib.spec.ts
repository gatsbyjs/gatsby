import fs from "fs-extra"
import path from "path"
import { IStateProgram } from "gatsby/src/internal"
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  printSchema,
} from "graphql"
import { cacheSchema, cacheGraphQLConfig } from "../lib"

jest.mock(`fs-extra`)

const cwd = process.cwd()

const cacheDirectory = `.cache`

const mockSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: `Query`,
    fields: {
      example: { type: GraphQLString },
    },
  }),
})

const mockProgram = {
  directory: cwd,
  https: false,
  host: `localhost`,
  port: 8080,
} as IStateProgram

// const mockStore = {
//   getStore: () => {
//     return {
//       schema: mockSchema,
//       program: mockProgram,
//     }
//   },
// }

describe(`cacheSchema`, () => {
  afterEach(() => {
    jest.resetAllMocks()
  })
  it(`will cache the printed schema output`, async () => {
    await cacheSchema(cacheDirectory, mockSchema)
    expect(fs.writeFile).toBeCalledWith(
      path.join(`.cache`, `schema.graphql`),
      printSchema(mockSchema)
    )
  })
})

describe(`cacheGraphQLConfig`, () => {
  it(`will cache a graphql config file`, async () => {
    await cacheGraphQLConfig(mockProgram)
    const config = JSON.stringify(
      {
        schema: path.join(cwd, `.cache`, `schema.graphql`),
        documents: [
          path.join(cwd, `src/**/**.{ts,js,tsx,jsx,esm}`),
          path.join(cwd, `.cache`, `fragments.graphql`),
        ],
        extensions: {
          endpoints: {
            default: {
              url: `http://localhost:8080/___graphql`,
            },
          },
        },
      },
      null,
      2
    )
    expect(fs.writeFile).toBeCalledWith(
      path.join(cwd, `.cache`, `graphql.config.json`),
      config
    )
  })
})
