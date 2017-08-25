new SourceDirectory({
  parsers: [
    {
      typeName: 'blogPosts',
      plugin: 'gatsby-source-markdown',
      selector: '(*.md|*.markdown}',
    },
    {
      typeName: '',
      plugin: 'gatsby-source-markdown',
      selector: '(*.md|*.markdown}',
    },
  ]
})

Just copy Jekyll?

/content -> markdown
/data -> yaml, csv, toml, json

With each parsers already setup. For data, the default is that each data
file is it's own type derived from the name of the file.

So file sources that have many things in one file — type === fileName
For file sources where each thing is a file — type is directory based.

Look by default for pages in /pages
but this is again just a plugin so you can add other directory sources
if desired.

composable themes? So have a base gatsby theme that has this minimal
jekyll-esque setup?

Other themes can build on top of it or of course there could be other
base themes.
