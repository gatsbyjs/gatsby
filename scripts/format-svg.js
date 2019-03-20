// this file exists because svgo only accepts folders or files, to make this work you'll need to do
// find www examples packages | grep '\\.svg$' | xargs -Iz -n 1 svgo --pretty --indent=2 --config=svgo.yml z
// this only works on bash not inside windows so we create a simple js file that does the globbing for us
const glob = require(`glob`)
const execa = require(`execa`)
const path = require(`path`)

// list of ignored files because they don't get optimized correctly
const ignoreList = [
  `./docs/blog/2017-11-08-migrate-from-jekyll-to-gatsby/diagram-ci.svg`,
]

const files = glob.sync(`./**/*.svg`, {
  ignore: [`./node_modules/**`].concat(ignoreList),
})

const proc = execa(
  `./node_modules/.bin/svgo`,
  [`--pretty`, `--indent=2`, `--config=svgo.yml`, `--multipass`].concat(files),
  { cwd: path.join(__dirname, `..`) }
)

proc.stdout.pipe(process.stdout)
proc.stderr.pipe(process.stderr)
