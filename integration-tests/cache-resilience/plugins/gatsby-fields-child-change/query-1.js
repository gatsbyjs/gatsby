module.exports = {
  query: `
    
{
  allParentChildChangeForFields {
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
        allParentChildChangeForFields: {
          nodes: [
            {
              foo: `run-1`,
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
