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
}
