const fetch = require(`../fetch`)

describe(`Fetching`, () => {
  it(`gets raw entity type for wordpress.com`, () => {
    const key = `/wp/v2/sites/example.wordpress.com/posts`
    const path = fetch.getRawEntityType(key)
    expect(path).toEqual(`posts`)
  })

  it(`gets route path for wordpress.com by removing base path from the full path`, () => {
    const key = `/wp/v2/sites/example.wordpress.com/posts`
    const baseUrl = `https://public-api.wordpress.com/wp/v2/sites/example.wordpress.com`
    const path = fetch.getRoutePath(baseUrl, key)
    expect(path).toEqual(`/posts`)
  })

  it(`gets route path for wordpress.org by removing base path from the full path`, () => {
    const key = `/wp-json/wp/v2/posts`
    const baseUrl = `http://dev-gatbsyjswp.pantheonsite.io/wp-json`
    const path = fetch.getRoutePath(baseUrl, key)
    expect(path).toEqual(`/wp/v2/posts`)
  })

  it(`builds full URL correctly for wordpress.com`, () => {
    const key = `/wp/v2/sites/example.wordpress.com/posts`
    const baseUrl = `https://public-api.wordpress.com/wp/v2/sites/example.wordpress.com`
    const fullUrl = fetch.buildFullUrl(baseUrl, key, true)
    expect(fullUrl).toEqual(
      `https://public-api.wordpress.com/wp/v2/sites/example.wordpress.com/posts`
    )
  })

  it(`builds full URL correctly for wordpress.org`, () => {
    const key = `/wp/v2/posts`
    const baseUrl = `http://dev-gatbsyjswp.pantheonsite.io/wp-json`
    const fullUrl = fetch.buildFullUrl(baseUrl, key, false)
    expect(fullUrl).toEqual(
      `http://dev-gatbsyjswp.pantheonsite.io/wp-json/wp/v2/posts`
    )
  })

  it(`properly use api URL if self uses same domain`, () => {
    expect(
      fetch.useApiUrl(
        `http://example.com/wp-json`,
        `http://example.com/wp-json/wp-api-menus/v2/menus/2`
      )
    ).toEqual(`http://example.com/wp-json/wp-api-menus/v2/menus/2`)
  })

  it(`properly use api URL if self route uses different domain`, () => {
    expect(
      fetch.useApiUrl(
        `http://example.com/wp-json`,
        `http://localhost:8080/wp-json/wp-api-menus/v2/menus/2`
      )
    ).toEqual(`http://example.com/wp-json/wp-api-menus/v2/menus/2`)
  })
})
