module.exports = {
  query: `
    
{
  allParentParentChangeForFields {
    nodes {
      foo
      fields {
        foo
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
      allParentParentChangeForFields: {
        nodes: [
          {
            foo: `run-1`,
            fields: {
              foo: `run-1`,
            },
            id: `parent_parentChangeForFields`,
            parent: null,
            children: [],
          },
        ],
      },
    },
  },
}
