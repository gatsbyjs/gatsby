const fs = require(`fs-extra`)
const path = require(`path`)
const _ = require(`lodash`)

const exclusionList = [
  `gatsby-starter-minimal`,
  `gatsby-starter-minimal-ts`,
  `gatsby-starter-plugin`,
  `gatsby-starter-theme-workspace`,
]

module.exports = {
  transforms: {
    LIST_STARTERS() {
      const base = path.join(process.cwd(), `starters`)
      const starters = fs
        .readdirSync(base)
        .filter(dir => fs.statSync(path.join(base, dir)).isDirectory())
        // Filter out excluded starters
        .filter(dir => !exclusionList.includes(dir))
        .reduce((merged, dir) => {
          merged[dir] = JSON.parse(
            fs.readFileSync(path.join(base, dir, `package.json`), `utf8`)
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
      const starter = path.basename(path.dirname(originalPath))

      if (exclusionList.includes(starter)) {
        return ``
      }

      const template = fs.readFileSync(
        path.join(process.cwd(), `starters`, `README-template.md`),
        `utf8`
      )
      return _.template(template)({
        name: starter,
      })
    },
  },
}
