module.exports = {
  query: `
    
{
  allParentChildDeletionForTransformer {
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
      allParentChildDeletionForTransformer: {
        nodes: [
          {
            foo: `run-1`,
            id: `parent_childDeletionForTransformer`,
            parent: null,
            children: [
              {
                id: `parent_childDeletionForTransformer >>> Child`,
              },
            ],
          },
        ],
      },
    },
  },
}
