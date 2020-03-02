module.exports = {
  query: `
      
  {
    allParentParentChangeForFields {
      nodes {
        bar
        fields {
          bar
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
            bar: `run-2`,
            fields: {
              bar: `run-2`,
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
