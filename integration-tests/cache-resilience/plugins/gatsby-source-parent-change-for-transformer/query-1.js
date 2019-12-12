module.exports = {
  query: `
    
{
  allParentParentChangeForTransformer {
    nodes {
      foo
      id
      parent {
        id
      }
      children {
        id
      }
      childChildOfParentParentChangeForTransformer {
        id
      }
    }
  }
}

  `,
  expectedResult: {
    data: {
      data: {
        allParentParentChangeForTransformer: {
          nodes: [
            {
              foo: `run-1`,
              id: `parent_parentChangeForTransformer`,
              parent: null,
              children: [
                {
                  id: `parent_parentChangeForTransformer >>> Child`,
                },
              ],
              childChildOfParentParentChangeForTransformer: {
                id: `parent_parentChangeForTransformer >>> Child`,
              },
            },
          ],
        },
      },
    },
  },
}
