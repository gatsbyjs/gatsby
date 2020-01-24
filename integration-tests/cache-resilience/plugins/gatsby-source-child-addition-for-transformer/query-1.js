module.exports = {
  query: `
    
{
  allParentChildAdditionForTransformer {
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
      allParentChildAdditionForTransformer: {
        nodes: [
          {
            foo: `run-1`,
            id: `parent_childAdditionForTransformer`,
            parent: null,
            children: [],
          },
        ],
      },
    },
  },
}
