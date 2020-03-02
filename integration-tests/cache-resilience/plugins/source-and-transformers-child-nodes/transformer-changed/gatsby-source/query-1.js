module.exports = {
  query: `
    
{
  allParentChildChangeForTransformer {
    nodes {
      foo
      id
    }
  }
}

  `,
  expectedResult: {
    data: {
      allParentChildChangeForTransformer: {
        nodes: [
          {
            foo: `run-1`,
            id: `parent_childChangeForTransformer`,
          },
        ],
      },
    },
  },
}
