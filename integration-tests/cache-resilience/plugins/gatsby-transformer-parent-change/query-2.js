module.exports = {
  query: `
      
  {
    allParentParentChangeForTransformer {
      nodes {
        bar
        id
        parent {
          id
        }
        children {
          id
        }
        childChildOfParentParentChangeForTransformer {
          bar
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
        allParentParentChangeForTransformer: {
          nodes: [
            {
              bar: `run-2`,
              id: `parent_parentChangeForTransformer`,
              parent: null,
              children: [
                {
                  id: `parent_parentChangeForTransformer >>> Child`,
                },
              ],
              childChildOfParentParentChangeForTransformer: {
                bar: `run-2`,
                id: `parent_parentChangeForTransformer >>> Child`,
                parent: {
                  id: `parent_parentChangeForTransformer`,
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
