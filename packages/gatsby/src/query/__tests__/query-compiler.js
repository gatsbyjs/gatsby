jest.mock(`glob`, () => {
  const sync = jest.fn().mockImplementation(() => [])
  return {
    sync,
  }
})

const _ = require(`lodash`)
const { parse, buildSchema } = require(`graphql`)
const fs = require(`fs-extra`)
const path = require(`path`)
const glob = require(`glob`)
const {
  resolveThemes,
  parseQueries,
  processQueries,
} = require(`../query-compiler`)

const base = path.resolve(``)

describe(`Runner`, () => {
  beforeEach(() => {
    glob.sync.mockClear()
  })

  describe(`expected directories`, () => {
    it(`compiles src directory`, async () => {
      const errors = []
      await parseQueries({
        base,
        additional: [],
        addError: e => {
          errors.push(e)
        },
      })

      expect(errors).toEqual([])

      expect(glob.sync).toHaveBeenCalledWith(
        expect.stringContaining(path.join(base, `src`)),
        expect.any(Object)
      )
    })

    it(`compiles fragments directory`, async () => {
      const errors = []
      await parseQueries({
        base,
        additional: [],
        addError: e => {
          errors.push(e)
        },
      })

      expect(errors).toEqual([])

      expect(glob.sync).toHaveBeenCalledWith(
        expect.stringContaining(path.join(base, `src`)),
        expect.any(Object)
      )
    })

    it(`compiles themes directory(s)`, async () => {
      const theme = `gatsby-theme-whatever`
      const errors = []
      await parseQueries({
        base,
        additional: [path.join(base, `node_modules`, theme)],
        addError: e => {
          errors.push(e)
        },
      })

      expect(errors).toEqual([])

      expect(glob.sync).toHaveBeenCalledWith(
        expect.stringContaining(path.join(base, `node_modules`, theme)),
        expect.any(Object)
      )
    })
  })
})

describe(`resolveThemes`, () => {
  it(`returns empty array if zero themes appear in store`, () => {
    ;[[], undefined].forEach(testRun => {
      expect(resolveThemes(testRun)).toEqual([])
    })
  })

  it(`returns themes in the store`, () => {
    const theme = `gatsby-theme-example`
    expect(
      resolveThemes([
        {
          name: theme,
          themeDir: path.join(base, `gatsby-theme-example`),
        },
      ])
    ).toEqual([expect.stringContaining(theme)])
  })

  it(`handles scoped packages`, () => {
    const theme = `@dschau/gatsby-theme-example`

    expect(
      resolveThemes([
        {
          name: theme,
          themeDir: path.join(base, theme),
        },
      ])
    ).toEqual([expect.stringContaining(theme.split(`/`).join(path.sep))])
  })
})

describe(`actual compiling`, () => {
  let schema
  beforeAll(async () => {
    const ast = await fs.readFile(
      path.join(__dirname, `./fixtures/query-compiler-schema.graphql`),
      { encoding: `utf-8` }
    )
    schema = buildSchema(ast)
  })

  it(`compiles a query`, async () => {
    const nodes = [
      createGatsbyDoc(
        `mockFile`,
        `query mockFileQuery {
             allPostsJson {
               nodes {
                 id
               }
            }
          }`
      ),
    ]
    const errors = []
    const result = processQueries({
      schema,
      parsedQueries: nodes,
      addError: e => {
        errors.push(e)
      },
    })
    expect(errors).toEqual([])
    expect(result.get(`mockFile`)).toMatchSnapshot()
  })

  it(`compiles static query`, async () => {
    const nodes = [
      createGatsbyDoc(
        `mockFile`,
        `query mockFileQuery {
             allPostsJson {
               nodes {
                 id
               }
            }
          }`,
        {
          isStaticQuery: true,
        }
      ),
    ]
    const errors = []
    const result = processQueries({
      schema,
      parsedQueries: nodes,
      addError: e => {
        errors.push(e)
      },
    })
    expect(errors).toEqual([])
    expect(result.get(`mockFile`)).toMatchSnapshot({
      id: expect.any(String),
    })
  })

  it(`adds fragments from same documents`, async () => {
    const nodes = [
      createGatsbyDoc(
        `mockFile`,
        `query mockFileQuery {
             allPostsJson {
               nodes {
                 ...PostsJsonFragment
               }
            }
          }

          fragment PostsJsonFragment on PostsJson {
            id
          }`
      ),
    ]
    const errors = []
    const result = processQueries({
      schema,
      parsedQueries: nodes,
      addError: e => {
        errors.push(e)
      },
    })
    expect(errors).toEqual([])
    expect(result.get(`mockFile`)).toMatchSnapshot()
  })

  it(`adds fragments from different documents`, async () => {
    const nodes = [
      createGatsbyDoc(
        `mockFile`,
        `query mockFileQuery {
             allPostsJson {
               nodes {
                 ...PostsJsonFragment
               }
            }
          }`
      ),
      createGatsbyDoc(
        `mockComponent`,
        `fragment PostsJsonFragment on PostsJson {
             id
          }`
      ),
    ]
    const errors = []
    const result = processQueries({
      schema,
      parsedQueries: nodes,
      addError: e => {
        errors.push(e)
      },
    })
    expect(errors).toEqual([])
    expect(result.get(`mockFile`)).toMatchSnapshot()
  })

  it(`handles fragments that use other fragments`, async () => {
    const nodes = [
      createGatsbyDoc(
        `mockFile`,
        `query mockFileQuery {
             allPostsJson {
               nodes {
                 ...PostsJsonFragment
               }
            }
          }`
      ),
      createGatsbyDoc(
        `mockComponent`,
        `fragment PostsJsonFragment on PostsJson {
             id
             ...AnotherPostsJsonFragment
          }

          fragment AnotherPostsJsonFragment on PostsJson {
            text
          }`
      ),
    ]

    const errors = []
    const result = processQueries({
      schema,
      parsedQueries: nodes,
      addError: e => {
        errors.push(e)
      },
    })
    expect(errors).toEqual([])
    expect(result.get(`mockFile`)).toMatchSnapshot()
  })

  it(`handles multiple fragment usages`, async () => {
    const nodes = [
      createGatsbyDoc(
        `mockFile1`,
        `query mockFileQuery1 {
          allDirectory {
            nodes {
              ...Foo
              ...Bar
            }
          }
        }`
      ),
      createGatsbyDoc(
        `mockFile2`,
        `query mockFileQuery2 {
          allDirectory {
            nodes {
              ...Bar
            }
          }
        }`
      ),
      createGatsbyDoc(
        `mockComponent1`,
        `fragment Bar on Directory {
          parent {
            ...Foo
          }
        }
        fragment Foo on Directory {
          id
        }
        `
      ),
    ]

    const errors = []
    const result = processQueries({
      schema,
      parsedQueries: nodes,
      addError: e => {
        errors.push(e)
      },
    })
    expect(errors.length).toEqual(0)
    expect(result.get(`mockFile1`)).toMatchInlineSnapshot(`
      Object {
        "hash": "hash",
        "isHook": false,
        "isStaticQuery": false,
        "name": "mockFileQuery1",
        "originalText": "query mockFileQuery1 {
                allDirectory {
                  nodes {
                    ...Foo
                    ...Bar
                  }
                }
              }",
        "path": "mockFile1",
        "text": "fragment Foo on Directory {
        id
      }

      fragment Bar on Directory {
        id
        parent {
          __typename
          id
          ...Foo
        }
      }

      query mockFileQuery1 {
        allDirectory {
          nodes {
            id
            ...Foo
            ...Bar
          }
        }
      }
      ",
      }
    `)
    expect(result.get(`mockFile2`)).toMatchInlineSnapshot(`
      Object {
        "hash": "hash",
        "isHook": false,
        "isStaticQuery": false,
        "name": "mockFileQuery2",
        "originalText": "query mockFileQuery2 {
                allDirectory {
                  nodes {
                    ...Bar
                  }
                }
              }",
        "path": "mockFile2",
        "text": "fragment Bar on Directory {
        id
        parent {
          __typename
          id
          ...Foo
        }
      }

      fragment Foo on Directory {
        id
      }

      query mockFileQuery2 {
        allDirectory {
          nodes {
            id
            ...Bar
          }
        }
      }
      ",
      }
    `)
  })

  it(`handles circular fragments`, async () => {
    const nodes = [
      createGatsbyDoc(
        `mockFile`,
        `query mockFileQuery {
          allDirectory {
            nodes {
              ...Foo
            }
          }
        }

        fragment Bar on Directory {
          parent {
            ...Foo
          }
        }

        fragment Foo on Directory {
          children {
            ...Bar
          }
        }`
      ),
    ]

    const errors = []
    const result = processQueries({
      schema,
      parsedQueries: nodes,
      addError: e => {
        errors.push(e)
      },
    })
    expect(errors.length).toEqual(1)
    expect(errors[0]).toMatchInlineSnapshot(
      {
        location: expect.any(Object),
      },
      `
      Object {
        "context": Object {
          "sourceMessage": "Cannot spread fragment \\"Foo\\" within itself via Bar.

      GraphQL request:17:13
      16 |           children {
      17 |             ...Bar
         |             ^
      18 |           }

      GraphQL request:11:13
      10 |           parent {
      11 |             ...Foo
         |             ^
      12 |           }",
        },
        "filePath": "mockFile",
        "id": "85901",
        "location": Any<Object>,
      }
    `
    )
    expect(result.size).toEqual(0)
  })

  it(`removes unused fragments from documents`, async () => {
    const nodes = [
      createGatsbyDoc(
        `mockFile`,
        `query mockFileQuery {
             allPostsJson {
               nodes {
                 ...PostsJsonFragment
               }
            }
          }

          fragment PostsJsonFragment on PostsJson {
            id
          }

          fragment UnusedFragment on PostsJson {
            id
          }`
      ),
    ]
    const errors = []
    const result = processQueries({
      schema,
      parsedQueries: nodes,
      addError: e => {
        errors.push(e)
      },
    })
    expect(errors).toEqual([])
    expect(result.get(`mockFile`)).toMatchSnapshot()
  })

  it(`errors on unknown fragment`, async () => {
    const nodes = [
      createGatsbyDoc(
        `mockFile`,
        `query mockFileQuery {
             allPostsJson {
               nodes {
                 ...UnknownFragment
               }
            }
          }`
      ),
    ]

    const errors = []
    const result = processQueries({
      schema,
      parsedQueries: nodes,
      addError: e => {
        errors.push(e)
      },
    })
    expect(errors).toMatchInlineSnapshot(`
      Array [
        Object {
          "context": Object {
            "closestFragment": undefined,
            "codeFrame": "  1 | query mockFileQuery {
        2 |              allPostsJson {
        3 |                nodes {
      > 4 |                  ...UnknownFragment
          |                  ^^^^^^^^^^^^^^^^^^
        5 |                }
        6 |             }
        7 |           }",
            "fragmentName": "UnknownFragment",
          },
          "filePath": "mockFile",
          "id": "85908",
        },
      ]
    `)
    expect(result).toEqual(new Map())
  })

  it(`errors on unknown fragment in other fragments`, async () => {
    const nodes = [
      createGatsbyDoc(
        `mockFile`,
        `query mockFileQuery {
             allPostsJson {
               nodes {
                 ...PostsJsonFragment
               }
            }
          }`
      ),
      createGatsbyDoc(
        `mockComponent`,
        `fragment PostsJsonFragment on PostsJson {
             id
             ...UnknownFragment
          }`
      ),
    ]

    const errors = []
    const result = processQueries({
      schema,
      parsedQueries: nodes,
      addError: e => {
        errors.push(e)
      },
    })
    expect(errors).toMatchInlineSnapshot(`
      Array [
        Object {
          "context": Object {
            "closestFragment": "PostsJsonFragment",
            "codeFrame": "  1 | fragment PostsJsonFragment on PostsJson {
        2 |              id
      > 3 |              ...UnknownFragment
          |              ^^^^^^^^^^^^^^^^^^
        4 |           }",
            "fragmentName": "UnknownFragment",
          },
          "filePath": "mockComponent",
          "id": "85908",
        },
      ]
    `)
    expect(result).toEqual(new Map())
  })

  it(`advices on similarly named fragment`, async () => {
    const nodes = [
      createGatsbyDoc(
        `mockFile`,
        `query mockFileQuery {
             allPostsJson {
               nodes {
                 ...PostJsonFragment
               }
            }
          }

          fragment PostsJsonFragment on PostsJson {
            id
          }`
      ),
    ]

    const errors = []
    const result = processQueries({
      schema,
      parsedQueries: nodes,
      addError: e => {
        errors.push(e)
      },
    })

    expect(errors).toMatchInlineSnapshot(
      `
      Array [
        Object {
          "context": Object {
            "closestFragment": "PostsJsonFragment",
            "codeFrame": "   1 | query mockFileQuery {
         2 |              allPostsJson {
         3 |                nodes {
      >  4 |                  ...PostJsonFragment
           |                  ^^^^^^^^^^^^^^^^^^^
         5 |                }
         6 |             }
         7 |           }
         8 |` +
        ` ` +
        `
         9 |           fragment PostsJsonFragment on PostsJson {
        10 |             id
        11 |           }",
            "fragmentName": "PostJsonFragment",
          },
          "filePath": "mockFile",
          "id": "85908",
        },
      ]
    `
    )
    expect(result).toEqual(new Map())
  })

  it(`accepts identical fragment definitions`, async () => {
    const nodes = [
      createGatsbyDoc(
        `mockFile`,
        `query mockFileQuery {
           allPostsJson {
             nodes {
               ...PostsJsonFragment
             }
          }
        }

        fragment PostsJsonFragment on PostsJson {
          id
        }`
      ),

      createGatsbyDoc(
        `mockComponent`,
        `fragment PostsJsonFragment on PostsJson {
            id
          }`
      ),
    ]

    const errors = []
    const result = processQueries({
      schema,
      parsedQueries: nodes,
      addError: e => {
        errors.push(e)
      },
    })
    expect(errors).toEqual([])
    expect(result).toMatchSnapshot()
  })

  it(`errors on duplicate fragment names`, async () => {
    const nodes = [
      createGatsbyDoc(
        `mockFile`,
        `query mockFileQuery {
           allPostsJson {
             nodes {
               ...PostsJsonFragment
             }
          }
        }

        fragment PostsJsonFragment on PostsJson {
          id
          node
        }`
      ),
      createGatsbyDoc(
        `mockComponent`,
        `fragment PostsJsonFragment on PostsJson {
            id
          }`
      ),
    ]
    const errors = []
    const result = processQueries({
      schema,
      parsedQueries: nodes,
      addError: e => {
        errors.push(e)
      },
    })
    expect(_.orderBy(errors, e => e.id)).toMatchInlineSnapshot(`
      Array [
        Object {
          "context": Object {
            "closestFragment": undefined,
            "codeFrame": "   1 | query mockFileQuery {
         2 |            allPostsJson {
         3 |              nodes {
      >  4 |                ...PostsJsonFragment
           |                ^^^^^^^^^^^^^^^^^^^^
         5 |              }
         6 |           }
         7 |         }
         8 | 
         9 |         fragment PostsJsonFragment on PostsJson {
        10 |           id
        11 |           node
        12 |         }",
            "fragmentName": "PostsJsonFragment",
          },
          "filePath": "mockFile",
          "id": "85908",
        },
        Object {
          "context": Object {
            "fragmentName": "PostsJsonFragment",
            "leftFragment": Object {
              "codeFrame": "> 1 | fragment PostsJsonFragment on PostsJson {
          |          ^^^^^^^^^^^^^^^^^
        2 |             id
        3 |           }",
              "filePath": "mockComponent",
            },
            "rightFragment": Object {
              "codeFrame": "   1 | query mockFileQuery {
         2 |            allPostsJson {
         3 |              nodes {
         4 |                ...PostsJsonFragment
         5 |              }
         6 |           }
         7 |         }
         8 | 
      >  9 |         fragment PostsJsonFragment on PostsJson {
           |                  ^^^^^^^^^^^^^^^^^
        10 |           id
        11 |           node
        12 |         }",
              "filePath": "mockFile",
            },
          },
          "id": "85919",
        },
      ]
    `)
    expect(result).toEqual(new Map())
  })

  it(`errors on wrong type of fragment`, async () => {
    const nodes = [
      createGatsbyDoc(
        `mockFile`,
        `query mockFileQuery {
           allPostsJson {
             nodes {
               ...PostsJsonFragment
             }
          }
        }`
      ),
      createGatsbyDoc(
        `mockComponent`,
        `fragment PostsJsonFragment on PostsJsonConnection {
          nodes {
            id
          }
        }`
      ),
    ]

    const errors = []
    const result = processQueries({
      schema,
      parsedQueries: nodes,
      addError: e => {
        errors.push(e)
      },
    })
    expect(errors).toMatchInlineSnapshot(`
      Array [
        Object {
          "context": Object {
            "sourceMessage": "Fragment \\"PostsJsonFragment\\" cannot be spread here as objects of type \\"PostsJson\\" can never be of type \\"PostsJsonConnection\\".

      GraphQL request:4:16
      3 |              nodes {
      4 |                ...PostsJsonFragment
        |                ^
      5 |              }",
          },
          "filePath": "mockFile",
          "id": "85901",
          "location": Object {
            "end": Object {
              "column": 16,
              "line": 4,
            },
            "start": Object {
              "column": 16,
              "line": 4,
            },
          },
        },
      ]
    `)
    expect(result).toEqual(new Map())
  })

  it(`errors on double root`, async () => {
    const nodes = [
      createGatsbyDoc(
        `mockFile`,
        `query mockFileQuery {
             allPostsJson {
               nodes {
                 id
               }
            }
          }

          query AnotherQuery {
            allPostsJson {
              nodes {
                id
              }
            }
          }`
      ),
    ]
    const errors = []
    const result = processQueries({
      schema,
      parsedQueries: nodes,
      addError: e => {
        errors.push(e)
      },
    })
    expect(errors).toMatchSnapshot()
    expect(result).toMatchSnapshot()
  })

  it(`errors on invalid graphql`, async () => {
    const nodes = [
      createGatsbyDoc(
        `mockFile`,
        `query {
             allPostsJson {
               nodes {
                 id
               }
            }
          }

          query {
            allFile {
              nodes {
                id
              }
            }
          }`
      ),
    ]
    const errors = []
    const result = processQueries({
      schema,
      parsedQueries: nodes,
      addError: e => {
        errors.push(e)
      },
    })
    expect(errors).toMatchInlineSnapshot(`
      Array [
        Object {
          "context": Object {
            "sourceMessage": "This anonymous operation must be the only defined operation.",
          },
          "filePath": "mockFile",
          "id": "85901",
          "location": Object {
            "start": Object {
              "column": 1,
              "line": 1,
            },
          },
        },
      ]
    `)
    expect(result).toEqual(new Map())
  })

  it(`errors on schema-aware invalid graphql`, async () => {
    const nodes = [
      createGatsbyDoc(
        `mockFile`,
        `query mockFileQuery {
             allPostsJson {
               id
            }
          }`
      ),
    ]
    const errors = []
    const result = processQueries({
      schema,
      parsedQueries: nodes,
      addError: e => {
        errors.push(e)
      },
    })
    expect(errors).toMatchInlineSnapshot(`
      Array [
        Object {
          "context": Object {
            "field": "id",
            "sourceMessage": "Cannot query field \\"id\\" on type \\"PostsJsonConnection\\".",
            "type": "PostsJsonConnection",
          },
          "filePath": "mockFile",
          "id": "85923",
          "location": Object {
            "end": Object {
              "column": 16,
              "line": 3,
            },
            "start": Object {
              "column": 16,
              "line": 3,
            },
          },
        },
      ]
    `)
    expect(result).toEqual(new Map())
  })
})

describe(`Extra fields`, () => {
  let schema
  beforeAll(async () => {
    const sdl = await fs.readFile(
      path.join(__dirname, `./fixtures/query-compiler-schema.graphql`),
      { encoding: `utf-8` }
    )
    schema = buildSchema(sdl)
  })

  const transformQuery = queryString => {
    const nodes = [createGatsbyDoc(`mockFile`, queryString)]
    const errors = []
    const result = processQueries({
      schema,
      parsedQueries: nodes,
      addError: e => {
        errors.push(e)
      },
    })
    return [result, errors]
  }

  it(`adds __typename field to abstract types`, async () => {
    const [result, errors] = transformQuery(`
      query mockFileQuery {
        allDirectory {
          nodes {
            contents {
              ... on File {
                id
              }
            }
            children {
              id
            }
          }
        }
      }
    `)
    expect(errors).toEqual([])
    expect(result.get(`mockFile`)).toMatchSnapshot()
  })

  it(`adds __typename field to abstract types within inline fragments`, async () => {
    const [result, errors] = transformQuery(`
      query mockFileQuery {
        allDirectory {
          nodes {
            ... on Directory {
              contents {
                ... on File {
                  id
                }
              }
              children {
                id
              }
            }
          }
        }
      }
    `)
    expect(errors).toEqual([])
    expect(result.get(`mockFile`)).toMatchSnapshot()
  })

  it(`adds __typename field to abstract types within fragments`, async () => {
    const [result, errors] = transformQuery(`
      query mockFileQuery {
        allDirectory {
          nodes {
            ...DirectoryContents
          }
        }
      }
      fragment DirectoryContents on Directory {
        contents {
          ... on File {
            id
          }
        }
        children {
          id
        }
      }
    `)
    expect(errors).toEqual([])
    expect(result.get(`mockFile`)).toMatchSnapshot()
  })

  it(`adds __typename field to abstract types in the query of arbitrary depth`, async () => {
    const [result, errors] = transformQuery(`
      query mockFileQuery {
        allDirectory {
          nodes {
            contents {
              ... on Directory {
                contents {
                  ... on Directory {
                    contents {
                      ... on Directory {
                        id
                      }
                    }
                    children {
                      id
                    }
                  }
                }
              }
            }
            children {
              children {
                children {
                  id
                }
                ... on Directory {
                  contents {
                    ... on File {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      }
    `)
    expect(errors).toEqual([])
    expect(result.get(`mockFile`)).toMatchSnapshot()
  })

  it(`doesn't add __typename field to abstract types twice`, async () => {
    const [result, errors] = transformQuery(`
      query mockFileQuery {
        allDirectory {
          nodes {
            contents {
              __typename
              ... on File {
                id
              }
              ... FileOrDirectory
            }
            children {
              __typename
              ... Node
            }
            ... on Directory {
              contents {
                __typename
              }
              children {
                __typename
              }
            }
            ...DirectoryContents
          }
        }
      }

      fragment DirectoryContents on Directory {
        contents {
          __typename
        }
        children {
          __typename
        }
      }

      fragment FileOrDirectory on FileOrDirectory {
        __typename
      }

      fragment Node on Node {
        __typename
      }
    `)
    expect(errors).toEqual([])
    expect(result.get(`mockFile`)).toMatchSnapshot()
  })

  it(`doesn't add __typename field when alias exists`, async () => {
    const [result, errors] = transformQuery(`
      query mockFileQuery {
        allDirectory {
          nodes {
            __typename: id
            contents {
              ... on File {
                __typename: id
              }
            }
            children {
              __typename: id
              ... Node
            }
            ... on Directory {
              children {
                __typename: id
              }
            }
            ...DirectoryContents
          }
        }
      }

      fragment DirectoryContents on Directory {
        children {
          __typename: id
        }
      }

      fragment Node on Node {
        __typename: id
      }
    `)
    expect(errors).toEqual([])
    expect(result.get(`mockFile`)).toMatchSnapshot()
  })

  it(`adds id field if type has it`, () => {
    const [result, errors] = transformQuery(`
      query mockFileQuery {
        allDirectory {
          nodes {
            __typename
          }
        }
      }
    `)
    expect(errors).toEqual([])
    expect(result.get(`mockFile`)).toMatchSnapshot()
  })

  it(`adds id field within inline fragment if type has it`, () => {
    const [result, errors] = transformQuery(`
      query mockFileQuery {
        allDirectory {
          nodes {
            ... on Directory {
              __typename
            }
          }
        }
      }
    `)
    expect(errors).toEqual([])
    expect(result.get(`mockFile`)).toMatchSnapshot()
  })

  it(`adds id field within fragment if type has it`, () => {
    const [result, errors] = transformQuery(`
      query mockFileQuery {
        allDirectory {
          nodes {
            ... Directory
          }
        }
      }
      fragment Directory on Directory {
        __typename
      }

    `)
    expect(errors).toEqual([])
    expect(result.get(`mockFile`)).toMatchSnapshot()
  })

  it(`adds id field in the query of arbitrary depth`, () => {
    const [result, errors] = transformQuery(`
      query mockFileQuery {
        allDirectory {
          nodes {
            contents {
              ... on Directory {
                contents {
                  ... on Directory {
                    contents {
                      ... on File {
                        __typename
                      }
                      ... on Directory {
                        __typename
                      }
                    }
                  }
                }
              }
            }
            children {
              children {
                children {
                  __typename
                }
                ... on Directory {
                  contents {
                    ... on File {
                      __typename
                    }
                  }
                }
              }
            }
          }
        }
      }
    `)
    expect(errors).toEqual([])
    expect(result.get(`mockFile`)).toMatchSnapshot()
  })

  it(`doesn't add id field twice`, async () => {
    const [result, errors] = transformQuery(`
      query mockFileQuery {
        allDirectory {
          nodes {
            id
            contents {
              ... on File {
                id
              }
              ... on Directory {
                id
              }
            }
            children {
              id
              ... Node
            }
            ... on Directory {
              id
              children {
                id
              }
            }
            ...DirectoryContents
          }
        }
      }

      fragment DirectoryContents on Directory {
        contents {
          ... on File {
            id
          }
          ... on Directory {
            id
          }
        }
        children {
          id
        }
      }

      fragment Node on Node {
        id
      }
    `)
    expect(errors).toEqual([])
    expect(result.get(`mockFile`)).toMatchSnapshot()
  })

  it(`doesn't add id field when alias for id exists`, async () => {
    const [result, errors] = transformQuery(`
      query mockFileQuery {
        allDirectory {
          nodes {
            contents {
              ... on File {
                id: absolutePath
              }
              ... on Directory {
                id: absolutePath
              }
            }
            ... on Directory {
              id: absolutePath
            }
            ...DirectoryContents
          }
        }
      }

      fragment DirectoryContents on Directory {
        contents {
          ... on File {
            id: absolutePath
          }
          ... on Directory {
            id: absolutePath
          }
        }
      }
    `)
    expect(errors).toEqual([])
    expect(result.get(`mockFile`)).toMatchSnapshot()
  })
})

const createGatsbyDoc = (
  filePath,
  query,
  { isHook, isStaticQuery } = { isHook: false, isStaticQuery: false }
) => {
  const doc = parse(query)
  return {
    filePath,
    doc,
    text: query,
    isHook,
    isStaticQuery,
    hash: `hash`,
    templateLoc: {
      start: {
        // so no idea, but it seems to work correctly on websites
        line: 1,
        column: 0,
      },
      end: {
        line: 1,
        column: 0,
      },
    },
  }
}
