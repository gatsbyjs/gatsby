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
      childChildOfParentChildDeletionForTransformer {
        id
      }
    }
  }
}

  `,
  expectedResult: {
    data: {
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
              childChildOfParentChildDeletionForTransformer: {
                id: `parent_childDeletionForTransformer >>> Child`,
              },
            },
          ],
        },
      },
    },
  },
}
