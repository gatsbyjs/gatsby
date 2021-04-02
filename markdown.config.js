const { readdirSync, statSync, readFileSync } = require(`fs-extra`)
const { join, basename, dirname } = require(`node:path`)
const makeTemplate = require(`lodash/template`)

module.exports = {
  transforms: {
    LIST_STARTERS() {
      const base = join(process.cwd(), `starters`)
      const starters = readdirSync(base)
        .filter(dir => statSync(join(base, dir)).isDirectory())
        // theme starters have their own README so skip those
        .filter(dir => !dir.includes(`theme`))
        .reduce((merged, dir) => {
          merged[dir] = JSON.parse(
            readFileSync(join(base, dir, `package.json`), `utf8`)
          )
          return merged
        }, {})

      return `
        |Name|Demo|Description|
        |:--:|----|-----------|
        ${Object.keys(starters)
          .map(name => {
            const starter = starters[name]
            return `
            |[${name}](https://github.com/gatsbyjs/gatsby-starter-${name})|[gatsby-starter-${name}-demo.netlify.app](https://gatsby-starter-${name}-demo.netlify.app/)|${starter.description}|
          `.trim()
          })
          .join(`\n`)}
      `.replace(/^[^|]+/gm, ``)
    },
    STARTER(content, options, { originalPath }) {
      const starter = basename(dirname(originalPath))
      const template = readFileSync(
        join(process.cwd(), `starters`, `README-template.md`),
        `utf8`
      )
      return makeTemplate(template)({
        name: starter,
      })
    },
  },
}
