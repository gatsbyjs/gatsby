import { derivePath } from "../derive-path"
import reporter from "gatsby/reporter"

describe(`derive-path`, () => {
  it(`has basic support`, async () => {
    const { derivedPath: one } = await derivePath(
      `product/{Product.id}`,
      { id: `1` },
      reporter
    )
    expect(one).toEqual(`product/1`)
    const { derivedPath: two } = await derivePath(
      `product/{product.id}`,
      { id: `2` },
      reporter
    )
    expect(two).toEqual(`product/2`)
    const { derivedPath: three } = await derivePath(
      `product/{p.d}`,
      { d: `3` },
      reporter
    )
    expect(three).toEqual(`product/3`)
    const { derivedPath: four } = await derivePath(
      `product/{p123_foo.d123_a}`,
      { d123_a: `4` },
      reporter
    )
    expect(four).toEqual(`product/4`)
  })

  it(`converts number to string in URL`, async () => {
    const { derivedPath } = await derivePath(
      `product/{Product.id}`,
      { id: 1 },
      reporter
    )
    expect(derivedPath).toEqual(`product/1`)
  })

  it(`has nested value support`, async () => {
    const { derivedPath } = await derivePath(
      `product/{Product.field__id}`,
      { field: { id: `1` } },
      reporter
    )
    expect(derivedPath).toEqual(`product/1`)
  })

  it(`has support for nested collections`, async () => {
    const { derivedPath: one } = await derivePath(
      `product/{Product.id}/{Product.field__name}`,
      { id: 1, field: { name: `foo` } },
      reporter
    )
    expect(one).toEqual(`product/1/foo`)
    const { derivedPath: two } = await derivePath(
      `product/{Product.id}-{Product.field__name}`,
      { id: 2, field: { name: `foo` } },
      reporter
    )
    expect(two).toEqual(`product/2-foo`)
  })

  it(`has support for nested collections with same field`, async () => {
    const { derivedPath: one } = await derivePath(
      `product/{Product.field__name}/{Product.field__category}`,
      { field: { name: `foo`, category: `bar` } },
      reporter
    )
    expect(one).toEqual(`product/foo/bar`)
    const { derivedPath: two } = await derivePath(
      `product/{Product.field__name}-{Product.field__category}`,
      { field: { name: `foo`, category: `bar` } },
      reporter
    )
    expect(two).toEqual(`product/foo-bar`)
  })

  it(`has union support`, async () => {
    const { derivedPath: one } = await derivePath(
      `product/{Product.field__(File)__id}`,
      {
        field: { id: `1` },
      },
      reporter
    )
    expect(one).toEqual(`product/1`)
    const { derivedPath: two } = await derivePath(
      `product/{Product.field__(File)__id}-{Product.field__(File)__foo}`,
      {
        field: { id: `2`, foo: `123` },
      },
      reporter
    )
    expect(two).toEqual(`product/2-123`)
  })

  it(`doesnt remove '/' from slug`, async () => {
    const { derivedPath } = await derivePath(
      `product/{Product.slug}`,
      {
        slug: `bar/baz`,
      },
      reporter
    )
    expect(derivedPath).toEqual(`product/bar/baz`)
  })

  it(`slugify's periods properly`, async () => {
    const { derivedPath: one } = await derivePath(
      `film/{Movie.title}`,
      {
        title: `Mrs. Doubtfire`,
      },
      reporter
    )
    expect(one).toEqual(`film/mrs-doubtfire`)
    const { derivedPath: two } = await derivePath(
      `film/{Movie.title}-{Movie.actor}`,
      {
        title: `Mrs. Doubtfire`,
        actor: `Mr. Gatsby`,
      },
      reporter
    )
    expect(two).toEqual(`film/mrs-doubtfire-mr-gatsby`)
  })

  it(`supports prefixes`, async () => {
    const { derivedPath } = await derivePath(
      `foo/prefix-{Model.name}`,
      {
        name: `dolores`,
      },
      reporter
    )
    expect(derivedPath).toEqual(`foo/prefix-dolores`)
  })

  it(`supports prefixes with nested collections`, async () => {
    const { derivedPath } = await derivePath(
      `foo/prefix{Model.name}/another-prefix_{Model.trait}`,
      {
        name: `dolores`,
        trait: `awesome`,
      },
      reporter
    )
    expect(derivedPath).toEqual(`foo/prefixdolores/another-prefix_awesome`)
  })

  it(`supports postfixes`, async () => {
    const { derivedPath } = await derivePath(
      `foo/{Model.name}-postfix`,
      {
        name: `dolores`,
      },
      reporter
    )
    expect(derivedPath).toEqual(`foo/dolores-postfix`)
  })

  it(`supports postfixes with nested collections`, async () => {
    const { derivedPath } = await derivePath(
      `foo/{Model.name}postfix/{Model.trait}_another-postfix`,
      {
        name: `dolores`,
        trait: `awesome`,
      },
      reporter
    )
    expect(derivedPath).toEqual(`foo/dolorespostfix/awesome_another-postfix`)
  })

  it(`supports nesting, characters in between, weird slugs, unions all in one`, async () => {
    const { derivedPath } = await derivePath(
      `blog/prefix-{M.name}.middle.{M.field__(Union)__color}_postfix/{M.director}--{M.s}`,
      {
        name: `Mr. Gatsby`,
        director: `doug_judy`,
        field: { color: `purple` },
        s: `/magic/wonderful`,
      },
      reporter
    )
    expect(derivedPath).toEqual(
      `blog/prefix-mr-gatsby.middle.purple_postfix/doug-judy--/magic/wonderful`
    )
  })

  it(`keeps existing slashes around and handles possible double forward slashes`, async () => {
    // This tests two things
    // 1) There shouldn't be a double forward slash in the final URL => blog//fire-and-powder/
    // 2) If the slug is supposed to be a URL (e.g. foo/bar) it should keep that
    const { derivedPath: one } = await derivePath(
      `blog/{MarkdownRemark.fields__slug}`,
      {
        fields: {
          slug: `/fire-and-powder/`,
        },
      },
      reporter
    )
    expect(one).toEqual(`blog/fire-and-powder/`)
    const { derivedPath: two } = await derivePath(
      `blog/{MarkdownRemark.fields__slug}`,
      {
        fields: {
          slug: `/fire-and-powder/and-water`,
        },
      },
      reporter
    )
    expect(two).toEqual(`blog/fire-and-powder/and-water`)
  })

  it(`supports file extension`, async () => {
    const { derivedPath } = await derivePath(
      `foo/{Model.name}.js`,
      {
        name: `dolores`,
      },
      reporter
    )
    expect(derivedPath).toEqual(`foo/dolores`)
  })

  it(`supports file extension with existing slashes around`, async () => {
    const { derivedPath: one } = await derivePath(
      `foo/{Model.name}.js`,
      {
        name: `/dolores/`,
      },
      reporter
    )
    expect(one).toEqual(`foo/dolores/`)
    const { derivedPath: two } = await derivePath(
      `foo/{Model.name}/template.js`,
      {
        name: `/dolores/`,
      },
      reporter
    )
    expect(two).toEqual(`foo/dolores/template`)
  })

  it(`supports mixed collection and client-only route`, async () => {
    const { derivedPath: one } = await derivePath(
      `foo/{Model.name}/[...name]`,
      {
        name: `dolores`,
      },
      reporter
    )
    expect(one).toEqual(`foo/dolores/[...name]`)
    const { derivedPath: two } = await derivePath(
      `{Model.name}/[...name]`,
      {
        name: `dolores`,
      },
      reporter
    )
    expect(two).toEqual(`dolores/[...name]`)
    const { derivedPath: three } = await derivePath(
      `{Model.name}/[name]`,
      {
        name: `dolores`,
      },
      reporter
    )
    expect(three).toEqual(`dolores/[name]`)
  })

  it(`supports index paths`, async () => {
    const { derivedPath: one } = await derivePath(
      `{Page.path}`,
      {
        path: `/`,
      },
      reporter
    )
    expect(one).toEqual(`index`)
    const { derivedPath: two } = await derivePath(
      `{Page.path}.js`,
      {
        path: `/`,
      },
      reporter
    )
    expect(two).toEqual(`index`)
    const { derivedPath: three } = await derivePath(
      `foo/{Page.path}`,
      {
        path: `/`,
      },
      reporter
    )
    expect(three).toEqual(`foo/`)
    const { derivedPath: four } = await derivePath(
      `foo/{Page.path}/bar`,
      {
        path: `/`,
      },
      reporter
    )
    expect(four).toEqual(`foo/bar`)
    const { derivedPath: five } = await derivePath(
      `foo/{Page.path}/bar/`,
      {
        path: `/`,
      },
      reporter
    )
    expect(five).toEqual(`foo/bar/`)
    const { derivedPath: six } = await derivePath(
      `foo/{Page.pathOne}/{Page.pathTwo}`,
      {
        pathOne: `/`,
        pathTwo: `bar`,
      },
      reporter
    )
    expect(six).toEqual(`foo/bar`)
    const { derivedPath: seven } = await derivePath(
      `foo/{Page.pathOne}/{Page.pathTwo}`,
      {
        pathOne: `/`,
        pathTwo: `/bar`,
      },
      reporter
    )
    expect(seven).toEqual(`foo/bar`)
    const { derivedPath: eight } = await derivePath(
      `foo/{Page.pathOne}/{Page.pathTwo}`,
      {
        pathOne: `/`,
        pathTwo: `/bar/`,
      },
      reporter
    )
    expect(eight).toEqual(`foo/bar/`)
    const { derivedPath: nine } = await derivePath(
      `foo/{Page.path}/[...name]`,
      {
        path: `/`,
      },
      reporter
    )
    expect(nine).toEqual(`foo/[...name]`)
  })

  it(`handles special chars`, async () => {
    const { derivedPath: one } = await derivePath(
      `foo/{Model.name}`,
      {
        name: `I ♥ Dogs`,
      },
      reporter
    )
    expect(one).toEqual(`foo/i-love-dogs`)
    const { derivedPath: two } = await derivePath(
      `foo/{Model.name}`,
      {
        name: `  Déjà Vu!  `,
      },
      reporter
    )
    expect(two).toEqual(`foo/deja-vu`)
    const { derivedPath: three } = await derivePath(
      `foo/{Model.name}`,
      {
        name: `fooBar 123 $#%`,
      },
      reporter
    )
    expect(three).toEqual(`foo/foo-bar-123`)
    const { derivedPath: four } = await derivePath(
      `foo/{Model.name}`,
      {
        name: `я люблю единорогов`,
      },
      reporter
    )
    expect(four).toEqual(`foo/ya-lyublyu-edinorogov`)
    const { derivedPath: five } = await derivePath(
      `foo/{Model.name}`,
      {
        name: `Münchner Weißwürstchen`,
      },
      reporter
    )
    expect(five).toEqual(`foo/muenchner-weisswuerstchen`)
  })

  it(`supports custom slugify options`, async () => {
    const { derivedPath: one } = await derivePath(
      `foo/{Model.name}`,
      {
        name: `BAR and baz`,
      },
      reporter,
      { separator: `_` }
    )
    expect(one).toEqual(`foo/bar_and_baz`)
    const { derivedPath: two } = await derivePath(
      `foo/{Model.name}`,
      {
        name: `Déjà Vu!`,
      },
      reporter,
      { lowercase: false }
    )
    expect(two).toEqual(`foo/Deja-Vu`)
    const { derivedPath: three } = await derivePath(
      `foo/{Model.name}`,
      {
        name: `fooBar`,
      },
      reporter,
      { decamelize: false }
    )
    expect(three).toEqual(`foo/foobar`)
    const { derivedPath: four } = await derivePath(
      `foo/{Model.name}`,
      {
        name: `this-is`,
      },
      reporter,
      { customReplacements: [[`this-is`, `the-way`]] }
    )
    expect(four).toEqual(`foo/the-way`)
    const { derivedPath: five } = await derivePath(
      `foo/{Model.name}`,
      {
        name: `_foo_bar`,
      },
      reporter,
      { preserveLeadingUnderscore: true }
    )
    expect(five).toEqual(`foo/_foo-bar`)
  })
})
