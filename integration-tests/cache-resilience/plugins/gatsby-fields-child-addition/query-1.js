module.exports = {
  query: `
    {
  allParentChildAdditionForFields {
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
        allParentChildAdditionForFields: {
          nodes: [
            {
              foo: `run-1`,
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
