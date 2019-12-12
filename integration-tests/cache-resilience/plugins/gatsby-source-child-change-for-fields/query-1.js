module.exports = {
  query: `
    
{
  allParentChildChangeForFields {
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
        allParentChildChangeForFields: {
          nodes: [
            {
              foo: `run-1`,
              fields: {
                foo1: `bar`,
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
