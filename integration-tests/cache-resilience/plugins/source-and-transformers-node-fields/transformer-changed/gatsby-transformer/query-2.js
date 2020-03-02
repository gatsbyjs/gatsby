module.exports = {
  query: `
    
{
  allParentChildChangeForFields {
    nodes {
      __typename
      fields {
        foo2
      }
    }
  }
}


  `,
  expectedResult: {},
}
