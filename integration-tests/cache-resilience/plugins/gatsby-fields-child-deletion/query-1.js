module.exports = {
  query: `
    
{
  allParentChildDeletionForFields {
    nodes {
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

  `,
  expectedResult: {
    data: {
      data: {
        allParentChildDeletionForFields: {
          nodes: [
            {
              foo: `run-1`,
              id: `parent_childDeletionForFields`,
              parent: null,
              children: [],
            },
          ],
        },
      },
    },
  },
}
