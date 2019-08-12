jest.mock("danger", () => jest.fn())

import { dateDaysAgo } from "../tasks/stale"

describe("date handling", () => {
  it("subtracts one day", () => {
    const dateToday = new Date(2015, 4, 21)
    const formatted = dateDaysAgo(dateToday, 1)
    expect(formatted).toEqual(`2015-05-20`)
  })
  it("subtracts across months", () => {
    const dateToday = new Date(2015, 4, 21)
    const formatted = dateDaysAgo(dateToday, 22)
    expect(formatted).toEqual(`2015-04-29`)
  })
  it("subtracts across years", () => {
    const dateToday = new Date(2015, 0, 21)
    const formatted = dateDaysAgo(dateToday, 21)
    expect(formatted).toEqual(`2014-12-31`)
  })
})

// test for quotes around labels
