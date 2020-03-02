module.exports = {
  query: `
    
{
  allParentChildDeletionForFields {
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
      allParentChildDeletionForFields: {
        nodes: [
          {
            __typename: "Parent_ChildDeletionForFields",
            fields: {
              foo1: "bar",
            },
          },
        ],
      },
    },
  },
}
