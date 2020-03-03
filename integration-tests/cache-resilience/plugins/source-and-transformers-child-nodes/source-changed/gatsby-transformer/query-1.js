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
              foo: `run-1`,
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
}
