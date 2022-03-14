import fs from "fs";
import path from "path";

import { NodePluginArgs } from "gatsby"
import { createContentDigest } from "gatsby-core-utils"

interface IMakeMockGatsbyApiArgs {
  mockStoreValue?: {
    status: {
      plugins: { [key: string]: any }
    }
  }
}

export function makeMockGatsbyApi({
  mockStoreValue = { status: { plugins: {} } },
}: IMakeMockGatsbyApiArgs = {}): NodePluginArgs {
  return {
    actions: {
      createTypes: jest.fn(),
      createNode: jest.fn(),
      touchNode: jest.fn(),
      deleteNode: jest.fn(),
      setPluginStatus: jest.fn(),
    },
    store: {
      getState: jest.fn().mockReturnValue(mockStoreValue),
    },
    reporter: {
      info: jest.fn(),
      panic: jest.fn(),
      activityTimer: jest.fn(() => ({
        start: jest.fn(),
        end: jest.fn(),
        setStatus: jest.fn(),
      })),
      setErrorMap: jest.fn(),
    },
    createContentDigest,
    createNodeId: jest.fn(),
    createResolvers: jest.fn(),
    cache: new Map(),
  } as unknown as NodePluginArgs
}

export function makeMockEnvironment(): (variables: "all" | "gatsby" | "netlify" | "none") => void {
  const OLD_ENV = process.env

  beforeEach(() => {
    process.env = { ...OLD_ENV }
    jest.resetModules()
  })

  afterAll(() => {
    process.env = { ...OLD_ENV }
  })

  return function mockEnvironment(variables: "all" | "gatsby" | "netlify" | "none") {
    switch(variables) {
      case "none":
        process.env.CI = undefined
        process.env.GATSBY_CLOUD = undefined
        process.env.GATSBY_IS_PR_BUILD = undefined
        process.env.NETLIFY = undefined
        process.env.CONTEXT = undefined
        break;
      case "gatsby":
        process.env.CI = `true`
        process.env.GATSBY_CLOUD = `true`
        process.env.GATSBY_IS_PR_BUILD = `false`
        process.env.NETLIFY = undefined
        process.env.CONTEXT = undefined
        break;
      case "netlify":
        process.env.CI = `true`
        process.env.GATSBY_CLOUD = undefined
        process.env.GATSBY_IS_PR_BUILD = undefined
        process.env.NETLIFY = `true`
        process.env.CONTEXT = `production`
        break;
      case "all":
        process.env.CI = `true`
        process.env.GATSBY_CLOUD = `true`
        process.env.GATSBY_IS_PR_BUILD = `false`
        process.env.NETLIFY = `true`
        process.env.CONTEXT = `production`
        break;
    }
  }
}

export function mockBulkResults(type: string): ReadableStream {
  return fs.createReadStream(
    path.join(__dirname, `./__data__/${type}.jsonl`)
  )
}
