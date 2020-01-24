module.exports = {
  query: `
    
{
  allParentChildDeletionForFields {
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
      allParentChildDeletionForFields: {
        nodes: [
          {
            foo: `run-1`,
            fields: {
              foo1: `bar`,
            },
            id: `parent_childDeletionForFields`,
            parent: null,
            children: [],
          },
        ],
      },
    },
  },
}
