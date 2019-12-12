module.exports = {
  query: `
    
{
  allIndependentStable {
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
        allIndependentStable: {
          nodes: [
            {
              foo: `bar`,
              id: `STABLE_NODE_1`,
              parent: null,
              children: [],
            },
          ],
        },
      },
    },
  },
}
