const babel = require(`babel-core`)
const preset = require(`../`)

function matchesSnapshot(query, options = {}) {
  const { code } = babel.transform(query, {
    presets: [[preset, options]],
  })
  expect(code).toMatchSnapshot()
}

it(`Applies @babel/preset-env for target browsers`, () => {
  matchesSnapshot(`const p = () => "s";`, { browser: true })
})

it(`Allows custom targets`, () => {
  matchesSnapshot(`const p = () => "s";`, {
    targets: { browsers: `last 1 Chrome versions` },
  })
})
