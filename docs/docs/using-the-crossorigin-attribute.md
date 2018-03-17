---
title: Using the crossorigin Attribute
---

Many times we need to include html tags which require the `crossorigin`
attribute which will output to a standard html page's source but in GatsbyJS we
need to use `crossOrigin`. This is because GatsbyJS uses
[webpack - output.crossOriginLoading](https://webpack.js.org/configuration/output/#output-crossoriginloading).
For more information on `crossOrigin` in webpack take look at
[webpack - output.crossOriginLoading](https://webpack.js.org/configuration/output/#output-crossoriginloading)
and webpack PR [#5729](https://github.com/webpack/webpack/pull/5729).

### Example Usage of crossOrigin
In these examples cases where `crossorigin` is required that we have used
`crossOrigin` instead so everything will function as expected when GatsbyJS
compiles our site. Note that the 'o' in 'origin' is now uppercase.

### GatsbyJS's gatsby/www/src/html.js

```html

<html {...this.props.htmlAttributes}>
  <head>
    <link
      rel="preload"
      href="/static/ftn45-webfont.c2439033.woff2"
      as="font"
      crossOrigin="anonymous"
    />
    <link
      rel="preload"
      href="/static/spectral-latin-400.d9fdfd34.woff2"
      as="font"
      crossOrigin="anonymous"
    />
    <link
      rel="preload"
      href="/static/ftn65-webfont.0ddc10d2.woff2"
      as="font"
      crossOrigin="anonymous"
    />
```

### For Bootstrap's 4.0.0 CDNs

```html

<link rel="stylesheet"
      href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"      
      integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm"
      crossOrigin="anonymous" />
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"   
        integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl"
        crossOrigin="anonymous">
</script>
```

### For jQuery and Popper.js

```html

<script src="https://code.jquery.com/jquery-3.2.1.slim.min.js"
        integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN"
        crossOrigin="anonymous">
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js"
        integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q"
        crossOrigin="anonymous">
</script>
```
