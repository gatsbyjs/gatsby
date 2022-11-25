# `@gatsbyjs/parcel-namer-relative-to-cwd`

Parcel by default is trying to find common/shared directory between entries and output paths are impacted by it. See https://github.com/parcel-bundler/parcel/issues/5476#issuecomment-769058504.

With these inputs files:

```
a.html
sub/b.html
```

You get:

- `parcel build a.html` => `dist/a.html`
- `parcel build sub/b.html` => `dist/b.html`
- `parcel build a.html sub/b.html` => `dist/a.html`, `dist/sub/b.html`

We can see that `sub/b.html` entry might result in either `dist/b.html` or `dist/sub/b.html` (depending wether `a.html` is entry or not). This makes builds not deterministic, which is very problematic where entries are "optional".

This namer plugin stabilize output, so inside `distDir` the hierarchy is the same as entry file in relation to current working directory (CWD):

- `parcel build a.html` => `dist/a.html`
- `parcel build sub/b.html` => `dist/sub/b.html`
- `parcel build a.html sub/b.html` => `dist/a.html`, `dist/sub/b.html`
