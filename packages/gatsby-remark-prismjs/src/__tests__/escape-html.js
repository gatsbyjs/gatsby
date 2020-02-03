const escapeHtml = require(`../escape-html`)

describe(`escaping html entities`, () => {
  it(`escapes base html when no additional escapes are passed in`, () => {
    const code = `hello world&><"'`
    expect(escapeHtml(code)).toBe(`hello world&amp;&gt;&lt;&quot;&#39;`)
  })

  it(`escapes additional html entities when passed in`, () => {
    const code = `hello world{`
    const mapping = {
      "{": `&#123;`,
    }
    expect(escapeHtml(code, mapping)).toBe(`hello world&#123;`)
  })

  it(`escapes base html entities and additional html entities`, () => {
    const code = `hello world&><"'{`
    const mapping = {
      "{": `&#123;`,
    }
    expect(escapeHtml(code, mapping)).toBe(
      `hello world&amp;&gt;&lt;&quot;&#39;&#123;`
    )
  })
})
