module.exports = {
  query: `
    
{
  allParentParentDeletionForTransformer {
    nodes {
      foo
      id
      parent {
        id
      }
      children {
        id
      }
      childChildOfParentParentDeletionForTransformer {
        id
      }
    }
  }
}

  `,
  expectedResult: {
    data: {
      allParentParentDeletionForTransformer: {
        nodes: [
          {
            foo: `run-1`,
            id: `parent_parentDeletionForTransformer`,
            parent: null,
            children: [
              {
                id: `parent_parentDeletionForTransformer >>> Child`,
              },
            ],
            childChildOfParentParentDeletionForTransformer: {
              id: `parent_parentDeletionForTransformer >>> Child`,
            },
          },
        ],
      },
    },
  },
}
