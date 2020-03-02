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
          id
        }
      }
    }
  }
  
    `,
  expectedResult: {
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
              id: `parent_parentChangeForTransformer >>> Child`,
            },
          },
        ],
      },
    },
  },
}
