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
                foo: `bar`,
                id: `parent_childDeletionForTransformer >>> Child`,
                parent: {
                  id: `parent_childDeletionForTransformer`,
                },
                children: [],
              },
            },
          ],
        },
      },
    },
  },
}
