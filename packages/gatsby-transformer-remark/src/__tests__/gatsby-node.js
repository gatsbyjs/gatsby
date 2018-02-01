const Promise = require(`bluebird`)
const _ = require(`lodash`)

const { onCreateNode } = require(`../gatsby-node`)

const {
  graphql,
  GraphQLObjectType,
  GraphQLList,
  GraphQLSchema,
} = require(`graphql`)
const {
  inferObjectStructureFromNodes,
} = require(`../../../gatsby/src/schema/infer-graphql-type`)

describe(`Process markdown content correctly`, () => {
  const node = {
    id: `whatever`,
    children: [],
    internal: {
      contentDigest: `whatever`,
      mediaType: `text/markdown`,
    },
  }

  // Make some fake functions its expecting.
  const loadNodeContent = node => Promise.resolve(node.content)

  describe(`Process generated markdown node correctly`, () => {
    it(`Correctly creates a new MarkdownRemark node`, async () => {
      const content = `---
title: "my little pony"
date: "2017-09-18T23:19:51.246Z"
---
Where oh where is my little pony?
            `
      node.content = content

      const createNode = jest.fn()
      const createParentChildLink = jest.fn()
      const actions = { createNode, createParentChildLink }
      const createNodeId = jest.fn()
      createNodeId.mockReturnValue(`uuid-from-gatsby`)

      await onCreateNode({
        node,
        loadNodeContent,
        actions,
        createNodeId,
      }).then(() => {
        expect(createNode.mock.calls).toMatchSnapshot()
        expect(
          _.isString(createNode.mock.calls[0][0].frontmatter.date)
        ).toBeTruthy()
        expect(createParentChildLink.mock.calls).toMatchSnapshot()
        expect(createNode).toHaveBeenCalledTimes(1)
        expect(createParentChildLink).toHaveBeenCalledTimes(1)
      })
    })

    it(`Correctly parses a graymatter excerpt`, async () => {
      const content = `---
title: "my little pony"
date: "2017-09-18T23:19:51.246Z"
---
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi auctor sit amet velit id facilisis. Nulla viverra, eros at efficitur pulvinar, lectus orci accumsan nisi, eu blandit elit nulla nec lectus. Integer porttitor imperdiet sapien. Quisque in orci sed nisi consequat aliquam. Aenean id mollis nisi. Sed auctor odio id erat facilisis venenatis. Quisque posuere faucibus libero vel fringilla.

In quis lectus sed eros efficitur luctus. Morbi tempor, nisl eget feugiat tincidunt, sem velit vulputate enim, nec interdum augue enim nec mauris. Nulla iaculis ante sed enim placerat pretium. Nulla metus odio, facilisis vestibulum lobortis vitae, bibendum at nunc. Donec sit amet efficitur metus, in bibendum nisi. Vivamus tempus vel turpis sit amet auctor. Maecenas luctus vestibulum velit, at sagittis leo volutpat quis. Praesent posuere nec augue eget sodales. Pellentesque vitae arcu ut est varius venenatis id maximus sem. Curabitur non consectetur turpis.

<!-- end -->

Maecenas sodales, arcu at dictum porta, sapien leo consectetur metus, nec rhoncus quam mauris vel odio. Vivamus sed sapien in massa pulvinar feugiat vel eu tellus. Nam rutrum sem nisi, vitae viverra erat varius ut. Praesent fringilla, metus in condimentum varius, ligula augue efficitur dolor, at tempus velit velit id arcu. Suspendisse urna est, blandit ac lacus id, efficitur semper purus. Etiam dignissim suscipit lorem accumsan ultricies. Duis lacinia tortor sapien, sed malesuada leo molestie nec. Sed lobortis varius ipsum, eu lobortis metus malesuada consequat. Sed purus nulla, tempor ac tincidunt et, blandit vel ex. Vestibulum id dolor non nulla posuere consectetur quis et turpis. Cras dolor metus, elementum a enim at, semper bibendum sapien. Sed lacus augue, laoreet in metus id, volutpat malesuada mauris.

Sed eu gravida mauris. Suspendisse potenti. Praesent sit amet egestas mi, sed hendrerit eros. Vestibulum congue scelerisque magna, id viverra justo congue nec. Duis id dapibus metus, et dictum erat. Nulla rhoncus a mauris nec tincidunt. Interdum et malesuada fames ac ante ipsum primis in faucibus. Donec elementum molestie ullamcorper. Nulla pulvinar feugiat mauris, placerat malesuada ligula rutrum non. Integer venenatis ex at dignissim fermentum. Nunc bibendum nulla in purus pharetra, non sodales justo fringilla.

Sed bibendum sem iaculis, pellentesque leo sed, imperdiet ante. Sed consequat mattis dui nec pretium. Donec vel consectetur est. Nam sagittis, libero vitae pretium pharetra, velit est dignissim erat, at cursus quam massa vitae ligula. Suspendisse potenti. In hac habitasse platea dictumst. Donec sit amet finibus justo. Mauris ante dolor, pulvinar vitae feugiat eu, rhoncus nec diam. In ut accumsan diam, faucibus fringilla odio. Nunc id ultricies turpis. Quisque justo quam, tristique sit amet interdum quis, facilisis at mi. Fusce porttitor vel sem ut condimentum. Praesent at libero congue, vulputate elit ut, rhoncus erat.
            `

      node.content = content

      const createNode = jest.fn()
      const createParentChildLink = jest.fn()
      const actions = { createNode, createParentChildLink }
      const createNodeId = jest.fn()
      createNodeId.mockReturnValue(`uuid-from-gatsby`)

      await onCreateNode(
        {
          node,
          loadNodeContent,
          actions,
          createNodeId,
        },
        { excerpt_separator: `<!-- end -->` }
      ).then(() => {
        expect(createNode.mock.calls).toMatchSnapshot()
        expect(_.isString(createNode.mock.calls[0][0].excerpt)).toBeTruthy()
        expect(createNode.mock.calls[0][0].excerpt).not.toEqual(0)
        expect(createParentChildLink.mock.calls).toMatchSnapshot()
        expect(createNode).toHaveBeenCalledTimes(1)
        expect(createParentChildLink).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe(`process graphql correctly`, () => {
    // given a set of nodes and a query, return the result of the query
    async function queryResult(nodes, fragment, { types = [] } = {}) {
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          name: `RootQueryType`,
          fields: () => {
            return {
              listNode: {
                name: `LISTNODE`,
                type: new GraphQLList(
                  new GraphQLObjectType({
                    name: `MarkdownRemark`,
                    fields: inferObjectStructureFromNodes({
                      nodes,
                      types: [...types],
                    }),
                  })
                ),
                resolve() {
                  return nodes
                },
              },
            }
          },
        }),
      })

      const result = await graphql(
        schema,
        `query {
                    listNode {
                        ${fragment}
                    }
                }
                `
      )
      return result
    }

    it(`Correctly queries an excerpt for a node with an excerpt separator`, done => {
      const content = `---
title: "my little pony"
date: "2017-09-18T23:19:51.246Z"
---
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi auctor sit amet velit id facilisis. Nulla viverra, eros at efficitur pulvinar, lectus orci accumsan nisi, eu blandit elit nulla nec lectus. Integer porttitor imperdiet sapien. Quisque in orci sed nisi consequat aliquam. Aenean id mollis nisi. Sed auctor odio id erat facilisis venenatis. Quisque posuere faucibus libero vel fringilla.

In quis lectus sed eros efficitur luctus. Morbi tempor, nisl eget feugiat tincidunt, sem velit vulputate enim, nec interdum augue enim nec mauris. Nulla iaculis ante sed enim placerat pretium. Nulla metus odio, facilisis vestibulum lobortis vitae, bibendum at nunc. Donec sit amet efficitur metus, in bibendum nisi. Vivamus tempus vel turpis sit amet auctor. Maecenas luctus vestibulum velit, at sagittis leo volutpat quis. Praesent posuere nec augue eget sodales. Pellentesque vitae arcu ut est varius venenatis id maximus sem. Curabitur non consectetur turpis.

<!-- end -->

Maecenas sodales, arcu at dictum porta, sapien leo consectetur metus, nec rhoncus quam mauris vel odio. Vivamus sed sapien in massa pulvinar feugiat vel eu tellus. Nam rutrum sem nisi, vitae viverra erat varius ut. Praesent fringilla, metus in condimentum varius, ligula augue efficitur dolor, at tempus velit velit id arcu. Suspendisse urna est, blandit ac lacus id, efficitur semper purus. Etiam dignissim suscipit lorem accumsan ultricies. Duis lacinia tortor sapien, sed malesuada leo molestie nec. Sed lobortis varius ipsum, eu lobortis metus malesuada consequat. Sed purus nulla, tempor ac tincidunt et, blandit vel ex. Vestibulum id dolor non nulla posuere consectetur quis et turpis. Cras dolor metus, elementum a enim at, semper bibendum sapien. Sed lacus augue, laoreet in metus id, volutpat malesuada mauris.

Sed eu gravida mauris. Suspendisse potenti. Praesent sit amet egestas mi, sed hendrerit eros. Vestibulum congue scelerisque magna, id viverra justo congue nec. Duis id dapibus metus, et dictum erat. Nulla rhoncus a mauris nec tincidunt. Interdum et malesuada fames ac ante ipsum primis in faucibus. Donec elementum molestie ullamcorper. Nulla pulvinar feugiat mauris, placerat malesuada ligula rutrum non. Integer venenatis ex at dignissim fermentum. Nunc bibendum nulla in purus pharetra, non sodales justo fringilla.

Sed bibendum sem iaculis, pellentesque leo sed, imperdiet ante. Sed consequat mattis dui nec pretium. Donec vel consectetur est. Nam sagittis, libero vitae pretium pharetra, velit est dignissim erat, at cursus quam massa vitae ligula. Suspendisse potenti. In hac habitasse platea dictumst. Donec sit amet finibus justo. Mauris ante dolor, pulvinar vitae feugiat eu, rhoncus nec diam. In ut accumsan diam, faucibus fringilla odio. Nunc id ultricies turpis. Quisque justo quam, tristique sit amet interdum quis, facilisis at mi. Fusce porttitor vel sem ut condimentum. Praesent at libero congue, vulputate elit ut, rhoncus erat.
            `

      node.content = content

      let createdNode
      const createNode = markdownNode =>
        queryResult(
          [markdownNode],
          `
                    excerpt
                    frontmatter {
                        title
                    }
                `,
          { types: [{ name: `MarkdownRemark` }] }
        ).then(result => {
          try {
            createdNode = result.data.listNode[0]
            expect(createdNode).toMatchSnapshot()
            expect(createdNode.excerpt)
              .toMatch(`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi auctor sit amet velit id facilisis. Nulla viverra, eros at efficitur pulvinar, lectus orci accumsan nisi, eu blandit elit nulla nec lectus. Integer porttitor imperdiet sapien. Quisque in orci sed nisi consequat aliquam. Aenean id mollis nisi. Sed auctor odio id erat facilisis venenatis. Quisque posuere faucibus libero vel fringilla.

In quis lectus sed eros efficitur luctus. Morbi tempor, nisl eget feugiat tincidunt, sem velit vulputate enim, nec interdum augue enim nec mauris. Nulla iaculis ante sed enim placerat pretium. Nulla metus odio, facilisis vestibulum lobortis vitae, bibendum at nunc. Donec sit amet efficitur metus, in bibendum nisi. Vivamus tempus vel turpis sit amet auctor. Maecenas luctus vestibulum velit, at sagittis leo volutpat quis. Praesent posuere nec augue eget sodales. Pellentesque vitae arcu ut est varius venenatis id maximus sem. Curabitur non consectetur turpis.

`)
            done()
          } catch (err) {
            done.fail(err)
          }
        })

      const createParentChildLink = jest.fn()
      const actions = { createNode, createParentChildLink }
      const createNodeId = jest.fn()
      createNodeId.mockReturnValue(`uuid-from-gatsby`)

      onCreateNode(
        {
          node,
          loadNodeContent,
          actions,
          createNodeId,
        },
        { excerpt_separator: `<!-- end -->` }
      )
    })

    it(`Correctly queries an excerpt for a node without an excerpt separator`, done => {
      const content = `---
title: "my little pony"
date: "2017-09-18T23:19:51.246Z"
---
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi auctor sit amet velit id facilisis. Nulla viverra, eros at efficitur pulvinar, lectus orci accumsan nisi, eu blandit elit nulla nec lectus. Integer porttitor imperdiet sapien. Quisque in orci sed nisi consequat aliquam. Aenean id mollis nisi. Sed auctor odio id erat facilisis venenatis. Quisque posuere faucibus libero vel fringilla.

In quis lectus sed eros efficitur luctus. Morbi tempor, nisl eget feugiat tincidunt, sem velit vulputate enim, nec interdum augue enim nec mauris. Nulla iaculis ante sed enim placerat pretium. Nulla metus odio, facilisis vestibulum lobortis vitae, bibendum at nunc. Donec sit amet efficitur metus, in bibendum nisi. Vivamus tempus vel turpis sit amet auctor. Maecenas luctus vestibulum velit, at sagittis leo volutpat quis. Praesent posuere nec augue eget sodales. Pellentesque vitae arcu ut est varius venenatis id maximus sem. Curabitur non consectetur turpis.

Maecenas sodales, arcu at dictum porta, sapien leo consectetur metus, nec rhoncus quam mauris vel odio. Vivamus sed sapien in massa pulvinar feugiat vel eu tellus. Nam rutrum sem nisi, vitae viverra erat varius ut. Praesent fringilla, metus in condimentum varius, ligula augue efficitur dolor, at tempus velit velit id arcu. Suspendisse urna est, blandit ac lacus id, efficitur semper purus. Etiam dignissim suscipit lorem accumsan ultricies. Duis lacinia tortor sapien, sed malesuada leo molestie nec. Sed lobortis varius ipsum, eu lobortis metus malesuada consequat. Sed purus nulla, tempor ac tincidunt et, blandit vel ex. Vestibulum id dolor non nulla posuere consectetur quis et turpis. Cras dolor metus, elementum a enim at, semper bibendum sapien. Sed lacus augue, laoreet in metus id, volutpat malesuada mauris.

Sed eu gravida mauris. Suspendisse potenti. Praesent sit amet egestas mi, sed hendrerit eros. Vestibulum congue scelerisque magna, id viverra justo congue nec. Duis id dapibus metus, et dictum erat. Nulla rhoncus a mauris nec tincidunt. Interdum et malesuada fames ac ante ipsum primis in faucibus. Donec elementum molestie ullamcorper. Nulla pulvinar feugiat mauris, placerat malesuada ligula rutrum non. Integer venenatis ex at dignissim fermentum. Nunc bibendum nulla in purus pharetra, non sodales justo fringilla.

Sed bibendum sem iaculis, pellentesque leo sed, imperdiet ante. Sed consequat mattis dui nec pretium. Donec vel consectetur est. Nam sagittis, libero vitae pretium pharetra, velit est dignissim erat, at cursus quam massa vitae ligula. Suspendisse potenti. In hac habitasse platea dictumst. Donec sit amet finibus justo. Mauris ante dolor, pulvinar vitae feugiat eu, rhoncus nec diam. In ut accumsan diam, faucibus fringilla odio. Nunc id ultricies turpis. Quisque justo quam, tristique sit amet interdum quis, facilisis at mi. Fusce porttitor vel sem ut condimentum. Praesent at libero congue, vulputate elit ut, rhoncus erat.
            `

      node.content = content

      let createdNode
      const createNode = markdownNode =>
        queryResult(
          [markdownNode],
          `
                    excerpt
                    frontmatter {
                        title
                    }
                `,
          { types: [{ name: `MarkdownRemark` }] }
        ).then(result => {
          try {
            createdNode = result.data.listNode[0]
            expect(createdNode).toMatchSnapshot()
            expect(createdNode.excerpt).toMatch(``)
            done()
          } catch (err) {
            done.fail(err)
          }
        })

      const createParentChildLink = jest.fn()
      const actions = { createNode, createParentChildLink }
      const createNodeId = jest.fn()
      createNodeId.mockReturnValue(`uuid-from-gatsby`)

      onCreateNode({
        node,
        loadNodeContent,
        actions,
        createNodeId,
      })
    })
  })
})
