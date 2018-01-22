import chroma from "chroma-js"

const colorStr = `
#281505
#042b1b
#2e1740
#3a2407
#073e2e
#452054
#48340a
#0d4f43
#5c2965
#53450e
#165e5a
#743272
#5c5815
#216c72
#8a3d7d
#636a1e
#2f798a
#9f4984
#697d2a
#4084a1
#b3568b
#6f8f39
#538eb6
#c36490
#75a14b
#6998c9
#d17494
#7db15f
#7fa1d9
#dd859a
#86c076
#96abe6
#e598a1
#91ce8e
#adb6f0
#ecabaa
#a0daa6
#c2c2f7
#f1beb6
#b1e5be
#d6cffb
#f4d1c6
#c6eed5
#e7defe
#f8e4d9
#def6ea
#f5eefe
#fcf6f0
`

const colors = {
  a: [],
  b: [],
  c: [],
  palette: chroma
    .scale([`#663399`, `#fbfafc`])
    // .gamma(0.4)
    .mode(`hsl`)
    // .correctLightness()
    .colors(10, `hsl`),
  brand: {
    // original palette by @SachaG
    // @see https://www.figma.com/file/J6IYJEtdRmwJQOrcZ2DfvxDD/Gatsby
    B700: `#663399`, // brand, was #744c9e
    B500: `#9D7CBF`, // brandLight
    B200: `#e0d6eb`, // lightPurple
    B100: `#f5f3f7`, // brandLighter, replacing veryLightPurple (the latter was #f6f2f8)
    B50: `#fbfafc`, // sidebar
  },
  // bolder palette by @ArchieHicklin
  // @see https://github.com/gatsbyjs/gatsby/issues/1173#issuecomment-309415650
  accent: `#ffb238`, // "Mustard",
  calm: `rgba(38, 32, 44, .5)`,
}

let pointer = `a`
colorStr
  .split(`\n`)
  .reverse()
  .forEach(c => {
    if (c === ``) return
    colors[pointer].push(c)
    switch (pointer) {
      case `a`:
        pointer = `b`
        break
      case `b`:
        pointer = `c`
        break
      case `c`:
        pointer = `a`
        break
    }
  })

module.exports = colors
