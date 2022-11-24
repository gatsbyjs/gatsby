import { makeNpmSafe } from "../../utils/make-npm-safe"

const tests = [
  [`A gatsby SiteHere`, `a-gatsby-site-here`],
  [`1 gatsby Site`, `1-gatsby-site`],
  [`1_gatsby Site`, `1_gatsby-site`],
  [`a--long---pause`, `a-long-pause`],
  [`Matt's Gatsby Site`, `matt-s-gatsby-site`],
  [`'nduja today`, `nduja-today`],
  [`"air quotes"`, `air-quotes`],
  [`gatsby.dev`, `gatsby.dev`],
  [`åland öl`, `land-l`],
  [`åland öl`, `land-l`],
  [`omg...`, `omg`],
  [`Fine.`, `fine`],
  [`^--xxx_Harryluv_99__xxx--^`, `xxx_harryluv_99__xxx`],
  [`...and`, `and`],
  [`.dot.`, `dot`],
  [`_lodash__`, `lodash`],
  [`Lohikäärme`, `lohik-rme`],
  [`🎃.institute`, `institute`],
  [`Wallpaper*`, `wallpaper`],
]

describe(`the string util functions`, () => {
  it(`create npm-legal package names`, () => {
    tests.forEach(([input, output]) => {
      expect(makeNpmSafe(input)).toEqual(output)
    })
  })
})
