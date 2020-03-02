module.exports = {
  query: `
    
{
  allParentChildChangeForFields {
    nodes {
      __typename
      fields {
        foo1
      }
    }
  }
}


  `,
  expectedResult: {
    data: {
      allParentChildChangeForFields: {
        nodes: [
          {
            __typename: "Parent_ChildChangeForFields",
            fields: {
              foo1: "bar",
            },
          },
        ],
      },
    },
  },
}
