jest.mock(`../dist/utils/fetch-graphql`, () => jest.fn())

import fetchGraphql from "../dist/utils/fetch-graphql"
import { fetchMediaItemsBySourceUrl, fetchMediaItemsById } from "../dist/steps/source-nodes/fetch-nodes/fetch-referenced-media-items"
import { createContentDigest } from "gatsby-core-utils"
import { getStore, createStore, asyncLocalStorage } from "../dist/store"

const fakeReporter = {
  panic: msg => {
    console.error(msg)
  },
  info: msg => {
    console.log(msg)
  },
}

const getNodeMock = jest.fn()

const btoa = (input) => Buffer.from(input).toString(`base64`)

const store = {store: createStore(), key: `test`}

const runWithGlobalStore = async (fn) => {
  asyncLocalStorage.run(store, fn)
}

const withGlobalStore = (fn) => () => {
     runWithGlobalStore(fn)
  }
describe(`fetch-referenced-media-items`, () => {
  beforeAll(withGlobalStore(() => {
    getStore().dispatch.gatsbyApi.setState({
      pluginOptions: {
        schema: {
          perPage: 2,
        },
      },
    })
  }))

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe(`fetchMediaItemsBySourceUrl`, () => {

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

    it(`should properly download multiple pages`, withGlobalStore(async () => {
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
    }))


    it(`should properly download a single page if there is only 1`, withGlobalStore(async () => {
      getStore().dispatch.gatsbyApi.setState({
        pluginOptions: {
          schema: {
            perPage: 5,
          },
        },
      })

      fetchGraphql
        .mockResolvedValueOnce({
          data: {
            mediaItem__index_0: {
              id: 0,
              mediaItemUrl: `https://wordpress.host/wp-content/uploads/2018/05/single-page-file1.mp3`,
            },
            mediaItem__index_1: {
              id: 1,
              mediaItemUrl: `https://wordpress.host/wp-content/uploads/2018/05/single-page-file1.mp3`,
            },
          },
        })

      const result = await fetchMediaItemsBySourceUrl({
        mediaItemUrls: [
          `https://wordpress.host/wp-content/uploads/2018/05/single-page-file1.mp3`,
          `https://wordpress.host/wp-content/uploads/2018/05/single-page-file2.mp3`,
        ],
        selectionSet: `id\nmediaItemUrl`,
        createContentDigest,
        helpers: createApi(),
      })
      expect(result).toHaveLength(2)
    }))
  })


  describe(`fetchMediaItemsById`, () => {

    const createApi = () => {
      return {
        actions: {
          createTypes: jest.fn(),
          createNode: jest.fn(),
          deleteNode: jest.fn(),
        },
        reporter: fakeReporter,
        createNodeId: jest.fn(),
        getNode: getNodeMock
      }
    }

    it(`should properly download multiple pages of ids`, withGlobalStore(async () => {
      getNodeMock
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce({
        localFile: {
          id: 0,
        }})
        .mockReturnValueOnce({
          localFile: {
            id: 1,
          }})
          .mockReturnValueOnce({
            localFile: {
              id: 2,
            }})
            .mockReturnValueOnce({
              localFile: {
                id: 3,
              }})
      getStore().dispatch.gatsbyApi.setState({
        pluginOptions: {
          schema: {
            perPage: 2,
          },
        },
      })


      fetchGraphql
        .mockResolvedValueOnce({
          data: {
            mediaItems: {
              nodes: [{
                id: 0,
                mediaItemUrl: `https://wordpress.host/wp-content/uploads/2018/05/file1.mp3`,
              },{
                id: 1,
                mediaItemUrl: `https://wordpress.host/wp-content/uploads/2018/05/file1.mp3`,
              },]
            }
          },
        })
        .mockResolvedValueOnce({
          data: {
            mediaItems: {
              nodes: [{
                id: 2,
                mediaItemUrl: `https://wordpress.host/wp-content/uploads/2018/05/file2.mp3`,
              },{
                id: 3,
                mediaItemUrl: `https://wordpress.host/wp-content/uploads/2018/05/file3.mp3`,
              },]
            }
          },
        })
      const result = await fetchMediaItemsById({
        mediaItemIds: [
          btoa(`attachment:1`),
          btoa(`attachment:2`),
          btoa(`attachment:3`),
          btoa(`attachment:4`),
        ],
        settings: {
          limit: 5
        },
        typeInfo: {
          pluralName: `mediaItems`,
          nodesTypeName: `MediaItem`
        },

        createContentDigest,
        helpers: createApi(),
      })
      expect(result).toHaveLength(4)
    }))


    it(`should properly download a single page of ids if there is only 1`, withGlobalStore(async () => {
      getNodeMock
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce({
        localFile: {
          id: 0,
        }})
        .mockReturnValueOnce({
          localFile: {
            id: 1,
          }})

      getStore().dispatch.gatsbyApi.setState({
        pluginOptions: {
          schema: {
            perPage: 5,
          },
        },
      })

      fetchGraphql
        .mockResolvedValueOnce({
          data: {
            mediaItems: {
              nodes: [{
                id: 0,
                mediaItemUrl: `https://wordpress.host/wp-content/uploads/2018/05/file1.mp3`,
              },{
                id: 1,
                mediaItemUrl: `https://wordpress.host/wp-content/uploads/2018/05/file1.mp3`,
              },]
            }
          },
        })

      const result = await fetchMediaItemsById({
        mediaItemIds: [
          btoa(`attachment:1`), btoa(`attachment:2`)
        ],
        settings: {
          limit: 5
        },
        typeInfo: {
          pluralName: `mediaItems`,
          nodesTypeName: `MediaItem`
        },

        selectionSet: `id\nmediaItemUrl`,
        createContentDigest,
        helpers: createApi(),
      })
      expect(result).toHaveLength(2)
    }))
  })
})