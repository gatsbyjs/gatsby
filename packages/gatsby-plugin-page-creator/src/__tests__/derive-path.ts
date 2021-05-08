import { derivePath } from "../derive-path"
import reporter from "gatsby/reporter"

describe(`derive-path`, () => {
  it(`has basic support`, () => {
    expect(
      derivePath(`product/{Product.id}`, { id: `1` }, reporter).derivedPath
    ).toEqual(`product/1`)
    expect(
      derivePath(`product/{product.id}`, { id: `1` }, reporter).derivedPath
    ).toEqual(`product/1`)
    expect(
      derivePath(`product/{p.d}`, { d: `1` }, reporter).derivedPath
    ).toEqual(`product/1`)
    expect(
      derivePath(`product/{p123_foo.d123_a}`, { d123_a: `1` }, reporter)
        .derivedPath
    ).toEqual(`product/1`)
  })

  it(`converts number to string in URL`, () => {
    expect(
      derivePath(`product/{Product.id}`, { id: 1 }, reporter).derivedPath
    ).toEqual(`product/1`)
  })

  it(`has nested value support`, () => {
    expect(
      derivePath(
        `product/{Product.field__id}`,
        { field: { id: `1` } },
        reporter
      ).derivedPath
    ).toEqual(`product/1`)
  })

  it(`has support for nested collections`, () => {
    expect(
      derivePath(
        `product/{Product.id}/{Product.field__name}`,
        { id: 1, field: { name: `foo` } },
        reporter
      ).derivedPath
    ).toEqual(`product/1/foo`)
    expect(
      derivePath(
        `product/{Product.id}-{Product.field__name}`,
        { id: 1, field: { name: `foo` } },
        reporter
      ).derivedPath
    ).toEqual(`product/1-foo`)
  })

  it(`has support for nested collections with same field`, () => {
    expect(
      derivePath(
        `product/{Product.field__name}/{Product.field__category}`,
        { field: { name: `foo`, category: `bar` } },
        reporter
      ).derivedPath
    ).toEqual(`product/foo/bar`)
    expect(
      derivePath(
        `product/{Product.field__name}-{Product.field__category}`,
        { field: { name: `foo`, category: `bar` } },
        reporter
      ).derivedPath
    ).toEqual(`product/foo-bar`)
  })

  it(`has union support`, () => {
    expect(
      derivePath(
        `product/{Product.field__(File)__id}`,
        {
          field: { id: `1` },
        },
        reporter
      ).derivedPath
    ).toEqual(`product/1`)

    expect(
      derivePath(
        `product/{Product.field__(File)__id}-{Product.field__(File)__foo}`,
        {
          field: { id: `1`, foo: `123` },
        },
        reporter
      ).derivedPath
    ).toEqual(`product/1-123`)
  })

  it(`doesnt remove '/' from slug`, () => {
    expect(
      derivePath(
        `product/{Product.slug}`,
        {
          slug: `bar/baz`,
        },
        reporter
      ).derivedPath
    ).toEqual(`product/bar/baz`)
  })

  it(`slugify's periods properly`, () => {
    expect(
      derivePath(
        `film/{Movie.title}`,
        {
          title: `Mrs. Doubtfire`,
        },
        reporter
      ).derivedPath
    ).toEqual(`film/mrs-doubtfire`)
    expect(
      derivePath(
        `film/{Movie.title}-{Movie.actor}`,
        {
          title: `Mrs. Doubtfire`,
          actor: `Mr. Gatsby`,
        },
        reporter
      ).derivedPath
    ).toEqual(`film/mrs-doubtfire-mr-gatsby`)
  })

  it(`supports prefixes`, () => {
    expect(
      derivePath(
        `foo/prefix-{Model.name}`,
        {
          name: `dolores`,
        },
        reporter
      ).derivedPath
    ).toEqual(`foo/prefix-dolores`)
  })

  it(`supports prefixes with nested collections`, () => {
    expect(
      derivePath(
        `foo/prefix{Model.name}/another-prefix_{Model.trait}`,
        {
          name: `dolores`,
          trait: `awesome`,
        },
        reporter
      ).derivedPath
    ).toEqual(`foo/prefixdolores/another-prefix_awesome`)
  })

  it(`supports postfixes`, () => {
    expect(
      derivePath(
        `foo/{Model.name}-postfix`,
        {
          name: `dolores`,
        },
        reporter
      ).derivedPath
    ).toEqual(`foo/dolores-postfix`)
  })

  it(`supports postfixes with nested collections`, () => {
    expect(
      derivePath(
        `foo/{Model.name}postfix/{Model.trait}_another-postfix`,
        {
          name: `dolores`,
          trait: `awesome`,
        },
        reporter
      ).derivedPath
    ).toEqual(`foo/dolorespostfix/awesome_another-postfix`)
  })

  it(`supports nesting, characters in between, weird slugs, unions all in one`, () => {
    expect(
      derivePath(
        `blog/prefix-{M.name}.middle.{M.field__(Union)__color}_postfix/{M.director}--{M.s}`,
        {
          name: `Mr. Gatsby`,
          director: `doug_judy`,
          field: { color: `purple` },
          s: `/magic/wonderful`,
        },
        reporter
      ).derivedPath
    ).toEqual(
      `blog/prefix-mr-gatsby.middle.purple_postfix/doug-judy--/magic/wonderful`
    )
  })

  it(`keeps existing slashes around and handles possible double forward slashes`, () => {
    // This tests three things
    // 1) The trailing slash should be removed (as createPath will be used later anyways)
    // 2) There shouldn't be a double forward slash in the final URL => blog//fire-and-powder/
    // 3) If the slug is supposed to be a URL (e.g. foo/bar) it should keep that
    expect(
      derivePath(
        `blog/{MarkdownRemark.fields__slug}`,
        {
          fields: {
            slug: `/fire-and-powder/`,
          },
        },
        reporter
      ).derivedPath
    ).toEqual(`blog/fire-and-powder`)
    expect(
      derivePath(
        `blog/{MarkdownRemark.fields__slug}`,
        {
          fields: {
            slug: `/fire-and-powder/and-water`,
          },
        },
        reporter
      ).derivedPath
    ).toEqual(`blog/fire-and-powder/and-water`)
  })

  it(`supports file extension`, () => {
    expect(
      derivePath(
        `foo/{Model.name}.js`,
        {
          name: `dolores`,
        },
        reporter
      ).derivedPath
    ).toEqual(`foo/dolores.js`)
  })

  it(`supports file extension with existing slashes around`, () => {
    expect(
      derivePath(
        `foo/{Model.name}.js`,
        {
          name: `/dolores/`,
        },
        reporter
      ).derivedPath
    ).toEqual(`foo/dolores.js`)
    expect(
      derivePath(
        `foo/{Model.name}/template.js`,
        {
          name: `/dolores/`,
        },
        reporter
      ).derivedPath
    ).toEqual(`foo/dolores/template.js`)
  })

  it(`supports mixed collection and client-only route`, () => {
    expect(
      derivePath(
        `foo/{Model.name}/[...name]`,
        {
          name: `dolores`,
        },
        reporter
      ).derivedPath
    ).toEqual(`foo/dolores/[...name]`)
  })

  it(`supports index paths`, () => {
    expect(
      derivePath(
        `{Page.path}`,
        {
          path: `/`,
        },
        reporter
      ).derivedPath
    ).toEqual(`index`)
    expect(
      derivePath(
        `{Page.path}.js`,
        {
          path: `/`,
        },
        reporter
      ).derivedPath
    ).toEqual(`index.js`)
    expect(
      derivePath(
        `foo/{Page.path}`,
        {
          path: `/`,
        },
        reporter
      ).derivedPath
    ).toEqual(`foo`)
    expect(
      derivePath(
        `foo/{Page.path}/bar`,
        {
          path: `/`,
        },
        reporter
      ).derivedPath
    ).toEqual(`foo/bar`)
  })

  it(`handles special chars`, () => {
    expect(
      derivePath(
        `foo/{Model.name}`,
        {
          name: `I ♥ Dogs`,
        },
        reporter
      ).derivedPath
    ).toEqual(`foo/i-love-dogs`)
    expect(
      derivePath(
        `foo/{Model.name}`,
        {
          name: `  Déjà Vu!  `,
        },
        reporter
      ).derivedPath
    ).toEqual(`foo/deja-vu`)
    expect(
      derivePath(
        `foo/{Model.name}`,
        {
          name: `fooBar 123 $#%`,
        },
        reporter
      ).derivedPath
    ).toEqual(`foo/foo-bar-123`)
    expect(
      derivePath(
        `foo/{Model.name}`,
        {
          name: `я люблю единорогов`,
        },
        reporter
      ).derivedPath
    ).toEqual(`foo/ya-lyublyu-edinorogov`)
    expect(
      derivePath(
        `foo/{Model.name}`,
        {
          name: `Münchner Weißwürstchen`,
        },
        reporter
      ).derivedPath
    ).toEqual(`foo/muenchner-weisswuerstchen`)
  })

  it(`supports custom slugify options`, () => {
    expect(
      derivePath(
        `foo/{Model.name}`,
        {
          name: `BAR and baz`,
        },
        reporter,
        { separator: `_` }
      ).derivedPath
    ).toEqual(`foo/bar_and_baz`)
    expect(
      derivePath(
        `foo/{Model.name}`,
        {
          name: `Déjà Vu!`,
        },
        reporter,
        { lowercase: false }
      ).derivedPath
    ).toEqual(`foo/Deja-Vu`)
    expect(
      derivePath(
        `foo/{Model.name}`,
        {
          name: `fooBar`,
        },
        reporter,
        { decamelize: false }
      ).derivedPath
    ).toEqual(`foo/foobar`)
    expect(
      derivePath(
        `foo/{Model.name}`,
        {
          name: `this-is`,
        },
        reporter,
        { customReplacements: [[`this-is`, `the-way`]] }
      ).derivedPath
    ).toEqual(`foo/the-way`)
    expect(
      derivePath(
        `foo/{Model.name}`,
        {
          name: `_foo_bar`,
        },
        reporter,
        { preserveLeadingUnderscore: true }
      ).derivedPath
    ).toEqual(`foo/_foo-bar`)
  })
})
