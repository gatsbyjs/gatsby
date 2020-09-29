const fs = require("fs-extra")
const faker = require(`faker`)

const N = parseInt(process.env.N, 10) || 100

function createArticle(n, sentence, slug) {
  const desc = faker.lorem.sentence()

  return {
    articleNumber: String(n),
    title: sentence,
    description: desc,
    slug,
    date: faker.date.recent(1000).toISOString().slice(0, 10),
    html: [faker.lorem.paragraphs(), faker.lorem.paragraphs()],
  }
}

;(async function () {
  console.log("Start of gen")

  console.log("Now generating " + N + " articles")
  let comma = ""
  await fs.writeFile("gendata.yaml", "") // Replace contents, regardless
  for (let i = 0; i < N; ++i) {
    const sentence = faker.lorem.sentence()
    const slug = faker.helpers.slugify(sentence).toLowerCase()
    const page = createArticle(i, sentence, slug)

    /*
    spec:
    https://yaml.org/spec/1.2/spec.html#id2786942

    on escaping:
    https://stackoverflow.com/questions/11301650/how-to-escape-indicator-characters-i-e-or-in-yaml
    There seem to be a few ways to "safely" escape the content
      - url: 'http://www.example-site.com/'
      - url: "http://www.example-site.com/"
      - url:
        http://www.example-site.com/
      - url: >-
        http://www.example-site.com/
      - url: |-
        http://www.example-site.com/

    (the dash prevents a trailing newline to be appended)
    > There is explicitly no form of escaping possible in "plain style", however.

    From the spec:
    > The double-quoted style is specified by surrounding “"” indicators. This is the only style capable of expressing
    > arbitrary strings, by using “\” escape sequences. This comes at the cost of having to escape the “\” and “"” characters.


    Not sure what performs best for yaml. We'll have to benchmark it a bit ^^
    */

    await fs.appendFile(
      "gendata.yaml",
      "- data:\n" +
        // Note: double quoted values preserve newlines but trim trailing spaces, which is okay for us (html)
        Object.keys(page)
          .map(key => {
            const v = page[key]
            if (Array.isArray(v)) {
              // Repeated key names under same parent should end up as array
              return '  ' + key + ':\n' +
                v.map(
                  v =>
                    '    - "' + v.replace(/(["\\])/g, "\\$1") + '"'
                )
                .join("\n")
            }
            return "  " + key + ': "' + v.replace(/(["\\])/g, "\\$1") + '"'
          })
          .join("\n") +
        "\n"
    )

    comma = "," // No comma before the first entry, no comma after the last
  }
  console.log("Finished generating " + N + " articles")

  console.log("End of gen")
})()
