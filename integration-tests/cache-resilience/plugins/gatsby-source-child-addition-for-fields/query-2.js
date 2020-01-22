module.exports = {
  query: `
      
  {
    allParentChildAdditionForFields {
      nodes {
        foo
        fields {
          foo1
        }
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
      data: {
        allParentChildAdditionForFields: {
          nodes: [
            {
              foo: `run-1`,
              foo1: `bar`,
              id: `parent_childAdditionForFields`,
              parent: null,
              children: [],
            },
          ],
        },
      },
    },
  },
}
