module.exports = {
  query: `
    {
      allIndependentChanging {
        nodes {
          foo
        }
      }
    }
  `,
  expectedResult: {
    data: {
      allIndependentChanging: {
        nodes: [
          {
            foo: `bar`,
          },
        ],
      },
    },
  },
}
