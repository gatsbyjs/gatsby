# Deploying Gatsby

## Best Practice


Though you can deploy from the same location multiple times it is recommended that you clear your public directory of any `.html` files before each build
e.g. using surge

```bash
rm -rf public/*.html && gatsby build && surge public/
```

because this is going to be executed on every deploy it is suggested that you use a `package.json` script to simplify this process

## Providers

[Surge.sh](http://surge.sh/)
[Forge](https://getforge.com/)
[Netlify](https://www.netlify.com/)
[GitHub-Pages](https://pages.github.com/)

## Debugging

`Unable to find element with ID ##`
or alternatively
`Uncaught Error: Minified React error #32; visit http://facebook.github.io/react/docs/error-decoder.html?invariant=32&args[]=## for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`

This is a new problem when dealing with static sites built with react.  React uses comments to help identify locations of components that render do not render anything.  If you are using a CDN that minifies your HTML it will eliminate the comments used by react to take control of the page on the client.
