const minimatch = require(`minimatch`)

describe.only(`Glob patterns in the README`, () => {
  const pattern = `**/pages`
  it(`should work on self hosted WordPress API instances`, () => {
    // API is located at /wp/v2/
    const routeExample = `/wp/v2/pages`

    expect(minimatch(routeExample, pattern)).toBe(true)
  })
  it(`should work on WordPress.com API instances`, () => {
    // API is located at /wp/v2/sites/example.wordpress.com/
    const routeExample = `/pages`

    expect(minimatch(routeExample, pattern)).toBe(true)
  })
})
