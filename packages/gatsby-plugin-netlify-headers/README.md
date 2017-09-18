# gatsby-plugin-netlify-headers

Generates a `_headers` file at the root of the public folder, to configure [HTTP headers on netlify](https://www.netlify.com/docs/headers-and-basic-auth/). Notably, you can immediately enable HTTP/2 server push of critical Gatsby assets through the `Link` headers.

By default, the plugin will add HTTP/2 assets to server push the critical Gatsby scripts (ones that have the `preload` attribute already). It will also add some basic security headers. You can easily add or replace headers through the plugin config.

## Install

`npm install --save gatsby-plugin-netlify-headers`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  ` gatsby-plugin-netlify-headers`, // make sure to put last in the array
]
```

## Configuration

If you just need the critical assets, you don't need to add any additional config. However, if you want to add headers, remove default headers, or transform the given headers, you can use the following configuration options.

```javascript
plugins: [
  // make sure to put last in the array
  {
    resolve: ` gatsby-plugin-netlify-headers`,
    options: {
      headers: {},                                  // option to add more headers. `Link` headers are transformed by the below criteria
      mergeSecurityHeaders: true,                   // boolean to turn off the default security headers
      mergeLinkHeaders: true,                       // boolean to turn off the default gatsby js headers
      mergeCachingHeaders: true,                    // boolean to turn off the default caching headers
      transformHeaders: (headers, path) => headers, // optional transform for manipulating headers under each path (e.g.sorting), etc.
    }
  }
]
```

### Headers

The headers object represents a JS version of the [netlify `_headers` file format](https://www.netlify.com/docs/headers-and-basic-auth/). You should pass in a object with string keys (representing the paths) and an array of strings for each header.

An example:

```javascript
{
  options: {
    headers: {
      "/*": [
        "Link: </static/logo.png>; rel=preload; as=image",
      ],
      "/my-page": [
        "Basic-Auth: someuser:somepassword anotheruser:anotherpassword",
        "Link: </other.css>; rel=preload; as=stylesheet",
        "Link: </other.js>; rel=preload; as=script",
        "Link: </other.jpg>; rel=preload; as=image",
      ],
    },
  }
}
````

Link paths are specially handed by this plugin. Since most files are processed and cache-busted through Gatsby (with a file hash), the plugin will transform any base file names to the hashed variants. If the file is not hashed, it will ensure the path is valid relative to the output `public` folder. You should be able to reference assets imported through javascript in the `static` folder.

You can validate the `_headers` config through the [netlify playground app](https://play.netlify.com/headers).
