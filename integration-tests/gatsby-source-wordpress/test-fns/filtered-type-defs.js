const { fetchGraphql } = require("./test-utils/graphql")

describe(`filtered type definitions`, () => {
  test(`Date field resolver is working`, async () => {
    const result = await fetchGraphql({
      url: `http://localhost:8000/___graphql`,
      query: /* GraphQL */ `
        {
          wpPage(id: { eq: "cG9zdDoy" }) {
            id
            databaseId
            year: date(formatString: "YYYY")
            month: date(formatString: "MMMM")
            dayOfMonth: date(formatString: "DD")
            dayOfWeekNumber: date(formatString: "E")
            dayOfWeekName: date(formatString: "dddd")
            date

            yearGmt: date(formatString: "YYYY")
            monthGmt: date(formatString: "MMMM")
            dayOfMonthGmt: date(formatString: "DD")
            dayOfWeekNumberGmt: date(formatString: "E")
            dayOfWeekNameGmt: date(formatString: "dddd")
            dateGmt: date
          }
        }
      `,
    })

    expect(result.data.wpPage).toBeTruthy()
    expect(result).toMatchSnapshot()
  })
})
