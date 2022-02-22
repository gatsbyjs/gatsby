const path = require(`path`)
const sharp = require(`sharp`)
const fit = [`cover`, `fill`, `outside`, `contain`]

const pipeline = sharp(path.join(__dirname, `./__fixtures__/dog-landscape.jpg`))

for (const f of fit) {
  pipeline.resize(300, 300, {
    fit: f,
  })

  pipeline.toFile(path.join(__dirname, `./__fixtures__/dog-300-${f}.jpg`))
}

// pipeline.resize(300, 300).jpeg({ quality: 75 }).png({ quality: 75 })
// pipeline.toFormat(`webp`).toFile(path.join(__dirname, `./__fixtures__/dog-300.webp`))
