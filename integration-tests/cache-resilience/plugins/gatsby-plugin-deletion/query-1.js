module.exports = {
  query: `
    
{
  allDeletion {
    nodes {
      foo
      id
      parent {
        id
      }
      children {
        id
      }
    }
  }
}


  `,
  expectedResult: {
    data: {
      data: {
        allDeletion: {
          nodes: [
            {
              foo: `bar`,
              id: `DELETION_NODE_1`,
              parent: null,
              children: [],
            },
          ],
        },
      },
    },
  },
}
