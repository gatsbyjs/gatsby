const { parseImportBindings } = require(`../import-parser`)
const grayMatter = require(`gray-matter`)
const mdx = require(`@mdx-js/mdx`)

function getBruteForceCases() {
  // These cases will be individually tested in four different ways;
  // - as is
  // - replace all spaces by newlines
  // - minified (drop all spaces that are not mandatory)
  // - replace all spaces by three spaces

  const bruteForceCases = `
    import foo from 'bar'
    import foo as bar from 'bar'
    import * as foo from 'bar'
    import {foo} from 'bar'
    import {foo as bar} from 'bar'
    import {foo, bar} from 'bar'
    import {foo, bar as boo} from 'bar'
    import {foo as bar} from 'bar'
    import {foo as bar, baz} from 'bar'
    import {foo as bar, baz as boo} from 'bar'
    import ding, {foo} from 'bar'
    import ding, {foo as bar} from 'bar'
    import ding, {foo, bar} from 'bar'
    import ding, {foo, bar as boo} from 'bar'
    import ding, {foo as bar} from 'bar'
    import ding, {foo as bar, baz} from 'bar'
    import ding, {foo as bar, baz as boo} from 'bar'
    import ding as dong, {foo} from 'bar'
    import ding as dong, {foo as bar} from 'bar'
    import ding as dong, {foo, bar} from 'bar'
    import ding as dong, {foo, bar as boo} from 'bar'
    import ding as dong, {foo as bar} from 'bar'
    import ding as dong, {foo as bar, baz} from 'bar'
    import ding as dong, {foo as bar, baz as boo} from 'bar'
    import * as dong, {foo} from 'bar'
    import * as dong, {foo as bar} from 'bar'
    import * as dong, {foo, bar} from 'bar'
    import * as dong, {foo, bar as boo} from 'bar'
    import * as dong, {foo as bar} from 'bar'
    import * as dong, {foo as bar, baz} from 'bar'
    import * as dong, {foo as bar, baz as boo} from 'bar'
    import * as $, {_ as bar, baz as boo} from 'bar'
    import _, {foo as $} from 'bar'
    import _ as $ from 'bar'
    import {_, $ as boo} from 'bar'
    import {_ as $, baz as boo} from 'bar'
    import {_, $} from 'bar'
    import as from 'bar'
    import * as as from 'bar'
    import from from 'bar'
    import * as from from 'bar'
    import as, {from} from 'bar'
    import as as x, {from as y} from 'bar'
    import x as as, {x as from} from 'bar'
    import from, {as} from 'bar'
    import from as x, {as as y} from 'bar'
    import x as from, {x as as} from 'bar'
    import {as, from} from 'bar'
    import {from, as} from 'bar'
    import {as as x, from as y} from 'bar'
    import {from as x, as as y} from 'bar'
    import {x as as, y as from} from 'bar'
    import {x as from, y as as} from 'bar'
    import {import as x} from 'bar'
    import {import as x, y} from 'bar'
    import {x, import as y} from 'bar'
    import Events from "@components/events/events"
    import {x, import as y} from 'bar';
    import foo from 'bar' // commment
    import foo from 'bar' // commment containing confusing from "chars"
    import foo from 'bar' // import bad from 'imp'
    import foo from 'bar'//next to it
    import "./empty.css"
    import "./empty.css"; // This happens in the real world
  `
    .trim()
    .split(/\n/g)
    .map(s => s.trim())

  // Add double cases
  bruteForceCases.push(
    `import multi as dong, {foo} from 'bar'\nimport as as x, {from as y} from 'bar'`
  )

  return bruteForceCases
}

describe(`regex import scanner`, () => {
  describe(`syntactic coverage`, () => {
    const cases = getBruteForceCases()

    cases.forEach((input, i) => {
      it(`should parse brute force regular case ${i}`, () => {
        const output = parseImportBindings(input, true)
        const bindings = output.bindings

        if (input.includes(`empty`)) {
          expect(output.bindings.length).toBe(0)
        } else {
          expect(output.bindings.length).not.toBe(0)
        }
        // Note: putting everything in the snapshot makes reviews easier
        expect({ input, result: output }).toMatchSnapshot()
        expect(
          // All bindings should be non-empty and trimmed
          output.bindings.every(
            binding => binding !== `` && binding === binding.trim()
          )
        ).toBe(true)

        // For the next tests, don't mangle the comment and make sure it doesn't
        // end up on a newline by itself. Test cases only have `//` for comment.
        let commentStart = input.indexOf(`//`) - 1
        if (commentStart < 0) commentStart = input.length
        const commentLess = input.slice(0, commentStart)
        const commentPart = input.slice(commentStart)

        // Confirm that the parser works when all spaces become newlines
        const newlined = commentLess.replace(/ /g, `\n`) + commentPart
        expect(parseImportBindings(newlined)).toEqual(bindings)

        // Confirm that the parser works with a minimal amount of spacing
        const minified =
          commentLess.replace(
            /(?<=[_\w$]) (?![_\w$])|(?<![_\w$]) (?=[_\w$])|(?<![_\w$]) (?![_\w$])/g,
            ``
          ) + commentPart
        expect(parseImportBindings(minified)).toEqual(bindings)

        // Confirm that the parser works with an excessive amount of spacing
        const blown = commentLess.replace(/ /g, `   `) + commentPart
        expect(parseImportBindings(blown)).toEqual(bindings)
      })
    })
  })

  describe(`multiple imports`, () => {
    it(`double import ends up as one pseudo-node in md parser`, async () => {
      // Note: the point of this test is to have two back2back imports clustered
      //       as one pseudo-node in the ast.

      const { content } = grayMatter(`
---
title: double test
---

import Events from "@components/events/events"
import EmailCaptureForm from "@components/email-capture-form"

<Events />
      `)

      const compiler = mdx.createCompiler()
      const fileOpts = { contents: content }
      const mdast = await compiler.parse(fileOpts)

      const imports = mdast.children.filter(obj => obj.type === `import`)

      // Assert the md parser outputs same mdast (update test if this changes)
      expect(
        imports.map(({ type, value }) => {
          return { type, value }
        })
      ).toMatchInlineSnapshot(`
        Array [
          Object {
            "type": "import",
            "value": "import Events from \\"@components/events/events\\"
        import EmailCaptureForm from \\"@components/email-capture-form\\"",
          },
        ]
      `)

      // Take the imports being parsed and feed them to the import parser
      expect(parseImportBindings(imports[0].value, true))
        .toMatchInlineSnapshot(`
        Object {
          "bindings": Array [
            "Events",
            "EmailCaptureForm",
          ],
          "segments": Array [
            "Events",
            "EmailCaptureForm",
          ],
        }
      `)
    })

    it(`triple imports without newlines`, async () => {
      // Note: the point of this test is to have multiple back2back imports
      //       clustered as one pseudo-node in the ast.

      const { content } = grayMatter(`
---
title: double test
---

import x, {frp, doo as dag} from "@components/events/events"
import * as EmailCaptureForm from "@components/email-capture-form"
import {A} from "@your/name"

<Events />
      `)

      const compiler = mdx.createCompiler()
      const fileOpts = { contents: content }
      const mdast = await compiler.parse(fileOpts)

      const imports = mdast.children.filter(obj => obj.type === `import`)

      // Assert the md parser outputs same mdast (update test if this changes)
      expect(
        imports.map(({ type, value }) => {
          return { type, value }
        })
      ).toMatchInlineSnapshot(`
        Array [
          Object {
            "type": "import",
            "value": "import x, {frp, doo as dag} from \\"@components/events/events\\"
        import * as EmailCaptureForm from \\"@components/email-capture-form\\"
        import {A} from \\"@your/name\\"",
          },
        ]
      `)

      // Take the imports being parsed and feed them to the import parser
      expect(parseImportBindings(imports[0].value, true))
        .toMatchInlineSnapshot(`
        Object {
          "bindings": Array [
            "x",
            "frp",
            "dag",
            "EmailCaptureForm",
            "A",
          ],
          "segments": Array [
            "x",
            "frp",
            "doo as dag",
            "* as EmailCaptureForm",
            "A",
          ],
        }
      `)
    })

    it(`triple imports with newlines`, async () => {
      // Note: the point of this test is to show that imports won't get
      //       clustered by the parser if there are empty lines between them

      const { content } = grayMatter(`
---
title: double test
---

import Events from "@components/events/events"

import EmailCaptureForm from "@components/email-capture-form"

import {A} from "@your/name"

<Events />
      `)

      const compiler = mdx.createCompiler()
      const fileOpts = { contents: content }
      const mdast = await compiler.parse(fileOpts)

      const imports = mdast.children.filter(obj => obj.type === `import`)

      expect(
        imports.map(({ type, value }) => {
          return { type, value }
        })
      ).toMatchInlineSnapshot(`
        Array [
          Object {
            "type": "import",
            "value": "import Events from \\"@components/events/events\\"",
          },
          Object {
            "type": "import",
            "value": "import EmailCaptureForm from \\"@components/email-capture-form\\"",
          },
          Object {
            "type": "import",
            "value": "import {A} from \\"@your/name\\"",
          },
        ]
      `)
    })

    it(`double import with shorthand import`, async () => {
      // Note: the point of this test is to have two back2back imports clustered
      //       as one pseudo-node in the ast where the first is the short-hand
      //       version of `import` that declares no symbols.

      const { content } = grayMatter(`
---
title: double test
---

import "./foo.css"
import Events from "@components/events/events"

<Events />
      `)

      const compiler = mdx.createCompiler()
      const fileOpts = { contents: content }
      const mdast = await compiler.parse(fileOpts)

      const imports = mdast.children.filter(obj => obj.type === `import`)

      // Assert the md parser outputs same mdast (update test if this changes)
      expect(
        imports.map(({ type, value }) => {
          return { type, value }
        })
      ).toMatchInlineSnapshot(`
        Array [
          Object {
            "type": "import",
            "value": "import \\"./foo.css\\"
        import Events from \\"@components/events/events\\"",
          },
        ]
      `)

      // Take the imports being parsed and feed them to the import parser
      expect(parseImportBindings(imports[0].value, true))
        .toMatchInlineSnapshot(`
        Object {
          "bindings": Array [
            "Events",
          ],
          "segments": Array [
            "Events",
          ],
        }
      `)
    })
  })
})
