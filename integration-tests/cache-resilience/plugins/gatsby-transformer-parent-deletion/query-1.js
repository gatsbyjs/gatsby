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
                foo: `run-1`,
                id: `parent_parentDeletionForTransformer >>> Child`,
                parent: {
                  id: `parent_parentDeletionForTransformer`,
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
