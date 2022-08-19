import { parseFrontmatter } from "../frontmatter"

const frontmatter = `---
title: frontmatter test
---
`

const content = `# Some Content

This is an *example*.

<Example />
`

describe(`frontmatter`, () => {
  it(`parses file with frontmatter data`, () => {
    const res = parseFrontmatter(`both`, `${frontmatter}\n${content}`)
    expect(res.body).not.toContain(`---`)
    expect(res.frontmatter).toMatchObject({ title: `frontmatter test` })
  })
  it(`parses file without frontmatter data`, () => {
    const res = parseFrontmatter(`without`, `${content}`)
    expect(Object.keys(res.frontmatter)).toHaveLength(0)
  })

  it(`cache does return valid results`, () => {
    parseFrontmatter(`cache`, `${frontmatter}\n${content}`)
    const res = parseFrontmatter(`cache`, `${frontmatter}\n${content}`)
    expect(res.body).not.toContain(`---`)
    expect(res.frontmatter).toMatchObject({ title: `frontmatter test` })
  })
  it(`does not parse javascript frontmatter`, () => {
    const res = parseFrontmatter(
      `javascript`,
      `---javascript
(() => {
require('fs').writeFileSync(process.cwd()+'/cypress/fixtures/file-to-attempt-rce-on.txt', (new Error('Helpful stack trace if this does execute. It should not execute.')).stack)
console.trace()
return {title: 'I should not be parsed',otherKey: 'Some other key'}
})()
---
${content}`
    )
    expect(res.body).not.toContain(`---`)
    expect(Object.keys(res.frontmatter)).toHaveLength(0)
  })
  it(`does not parse js frontmatter`, () => {
    const res = parseFrontmatter(
      `js`,
      `---js
(() => {
require('fs').writeFileSync(process.cwd()+'/cypress/fixtures/file-to-attempt-rce-on.txt', (new Error('Helpful stack trace if this does execute. It should not execute.')).stack)
console.trace()
return {title: 'I should not be parsed',otherKey: 'Some other key'}
})()
---
${content}`
    )
    expect(res.body).not.toContain(`---`)
    expect(Object.keys(res.frontmatter)).toHaveLength(0)
  })
})
