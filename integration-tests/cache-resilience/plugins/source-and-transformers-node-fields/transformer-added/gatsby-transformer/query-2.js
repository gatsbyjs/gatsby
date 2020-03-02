module.exports = {
  query: `
    
{
  allParentChildAdditionForFields {
    nodes {
      __typename
      fields {
        foo1
      }
    }
  }
}


  `,
  expectedResult: {},
}
