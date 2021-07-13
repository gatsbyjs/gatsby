jest.mock(`../dist/utils/fetch-graphql`, () => jest.fn())

import { getHelpers } from "../dist/utils/get-gatsby-api"
import fetchGraphql from "../dist/utils/fetch-graphql"
import { fetchMediaItemsBySourceUrl } from "../dist/steps/source-nodes/fetch-nodes/fetch-referenced-media-items"
import { createContentDigest } from "gatsby-core-utils"
import store from "../dist/store"

const fakeReporter = {
  panic: msg => {
    console.error(msg)
  },
  info: msg => {
    console.log(msg)
  },
}

const createApi = () => {
  return {
    actions: {
      createTypes: jest.fn(),
      createNode: jest.fn(),
      deleteNode: jest.fn(),
    },
    reporter: fakeReporter,
    createNodeId: jest.fn(),
    async getNode(id) {
      return {
        localFile: {
          id: id,
        },
      }
    },
  }
}

describe(`fetchMediaItemsBySourceUrl`, () => {
  beforeAll(() => {
    store.dispatch.gatsbyApi.setState({
      pluginOptions: {
        schema: {
          perPage: 2,
        },
      },
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it(`should properly download multiple pages`, async () => {
    fetchGraphql
      .mockResolvedValueOnce({
        data: {
          mediaItem__index_0: null,
          mediaItem__index_1: null,
        },
      })
      .mockResolvedValueOnce({
        data: {
          mediaItem__index_2: {
            id: 2,
            mediaItemUrl: `https://wordpress.host/wp-content/uploads/2018/05/file1.mp3`,
          },
          mediaItem__index_3: {
            id: 3,
            mediaItemUrl: `https://wordpress.host/wp-content/uploads/2018/05/file1.mp3`,
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          mediaItem__index_4: null,
          mediaItem__index_5: null,
        },
      })
      .mockResolvedValueOnce({
        data: {
          mediaItem__index_6: null,
          mediaItem__index_7: null,
        },
      })
    const result = await fetchMediaItemsBySourceUrl({
      mediaItemUrls: [
        `https://wordpress.host/wp-content/uploads/2018/05/file1.mp3?_=7`,
        `https://wordpress.host/wp-content/uploads/2018/05/file2.mp3?_=7`,
        `https://wordpress.host/wp-content/uploads/2018/05/file1.mp3`,
        `https://wordpress.host/wp-content/uploads/2018/05/file2.mp3`,
      ],
      createContentDigest,
      helpers: createApi(),
    })
    expect(result).toHaveLength(2)
  })
})
