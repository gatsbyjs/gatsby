module.exports = {
  query: `
      
  {
    allParentChildChangeForFields {
      nodes {
        foo
        fields {
          foo2
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
        allParentChildChangeForFields: {
          nodes: [
            {
              foo: `run-1`,
              fields: {
                foo2: `baz`,
              },
              id: `parent_childChangeForFields`,
              parent: null,
              children: [],
            },
          ],
        },
      },
    },
  },
}
