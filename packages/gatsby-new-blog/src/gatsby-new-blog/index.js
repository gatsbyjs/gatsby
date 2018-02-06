#!/usr/bin/env node

const path = require(`path`)
const chalk = require(`chalk`)
const figlet = require(`figlet`)
const inquirer = require(`inquirer`)
const pinyin = require(`pinyin`)
const rewritePattern = require(`regexpu-core`)
const commander = require(`commander`)
const config = require(`config`)
const fs = require(`fs-extra`)
const moment = require(`moment`)

const paths = require(`./paths`)

const packageJson = require(paths.packageDir)
let blog

const check = () => {
  try {
    if (
      config.get(`blog`) &&
      config.get(`blog.header`) &&
      config.get(`blog.question`) &&
      require(`fs`).existsSync(paths.coverImg)
    ) {
      blog = config.get(`blog`)
      return
    }
    throw `Please config config/default.yml correctly, header and question is requiredi, and put a 1200 * 600 size header.png in static/`
  } catch (err) {
    console.log(chalk.red(err))
    process.exit(1)
  }
}

const getTitle = title => {
  const cnPattern = rewritePattern(`\\p{Unified_Ideograph}`, `u`, {
    unicodePropertyEscape: true,
    useUnicodeFlag: true,
  })
  const pattern = `[^${cnPattern.slice(1, -1)}^a-z^A-Z^0-9\\s]`
  const re = new RegExp(pattern, `gu`)

  const targetTitle = pinyin(title.trim().replace(re, ``), {
    style: pinyin.STYLE_NORMAL,
  }).reduce(
    (p, c) =>
      p.concat(
        `-${c[0]
          .trim()
          .replace(/\s/g, `-`)
          .toLowerCase()}`
      ),
    ``
  )

  return targetTitle
}

const getData = answers => {
  const keys = Object.keys(answers)
  const content = keys.reduce((p, c) => p.concat(`${c}: ${answers[c]}\n`), ``)

  const data = `---
${content}date: ${moment().format()}
---

![${answers.title || `img`}](./header.png)
`

  return data
}

const printQuestion = () => {
  const { question } = blog
  const blogConfig = question ? Object.keys(question).map(x => question[x]) : {}

  inquirer
    .prompt(blogConfig)
    .then(answers => {
      const today = moment().format(`YYYY-MM-DD`)
      let targetTitle = ``

      if (answers.title) {
        targetTitle = getTitle(answers.title)
      }

      const data = getData(answers)

      const folderDir = path.join(paths.pagesDir, `${today}${targetTitle}`)
      fs.ensureDir(folderDir).then(() => {
        fs.writeFile(`${folderDir}/index.md`, data, err => {
          if (err) return console.error(err)

          return fs.copy(paths.coverImg, `${folderDir}/header.png`).then(() => {
            console.log()
            console.log(`${chalk.green(`success`)} ${folderDir}/index.md`)
            console.log(`${chalk.green(`success`)} ${folderDir}/header.png`)

            if (blog.warning) {
              console.log()
              console.log(chalk.yellow(blog.warning))
            }
            console.log()
            if (blog.info) {
              console.log(chalk.blue(blog.info))
              console.log()
            }
          })
        })
      })
    })
    .catch(err => {
      console.log(chalk.red(`question config error`))
      process.exit(1)
    })
}

const printName = () => {
  figlet.text(
    blog.header,
    {
      horizontalLayout: `full`,
    },
    (err, data) => {
      if (err) {
        console.log(`Something went wrong...`)
        console.dir(err)
        return
      }
      console.log(chalk.cyan(data))
      console.log()

      printQuestion()
    }
  )
}

const start = () => {
  const program = new commander.Command(packageJson.name)
    .version(packageJson.version, `-v, --version`)
    .option(`start`, `new blog for gatsby`)
    .parse(process.argv)

  if (program.start) {
    check()
    printName()
  }
}

start()
