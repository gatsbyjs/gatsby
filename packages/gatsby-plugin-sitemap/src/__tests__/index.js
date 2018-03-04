const { regexExclude404AndOfflineShell } = require(`../internals`)

describe(`gatsby-plugin-sitemap`, () => {
  it(`regex for filtering out 404 pages`, () => {
    const regex = new RegExp(regexExclude404AndOfflineShell)

    // 404 pages
    expect(regex.exec(`/404`)).toBeNull()
    expect(regex.exec(`/404.html`)).toBeNull()
    expect(regex.exec(`/dev-404-page`)).toBeNull()
    expect(regex.exec(`/404page`)).toBeNull()
    expect(regex.exec(`/404-and-now-anything`)).toBeNull()

    // gatsby-plugin-offline app shell fallback
    expect(regex.exec(`/offline-plugin-app-shell-fallback`)).toBeNull()

    // Generic valid pages
    expect(regex.exec(`/my-page`)).not.toBeNull()
    expect(regex.exec(`/my-page-404123`)).not.toBeNull()
    expect(regex.exec(`/my-page-404`)).not.toBeNull()
    expect(regex.exec(`/my-offline-plugin-app-shell-fallback`)).not.toBeNull()
  })
})
