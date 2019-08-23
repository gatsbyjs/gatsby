/* globals page */

describe(`Production build tests`, () => {
  it(`should render properly`, async () => {
    await page.goto(`https://www.google.com/`)
    expect(await page.title()).toMatch(`Google`)
  })
})
