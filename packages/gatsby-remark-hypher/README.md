# gatsby-remark-hypher

Adds hyphenation to your Markdown posts using the [hypher](https://github.com/bramstein/hypher) plugin.

## Why?

Even though CSS has a `hyphens` rule, it lacks the ability to finetune the hyphenation behaviour, letting the browser decide how best to hyphenate. For most people, this default behaviour may be sufficient.

For those who desire more fine-grained hyphenation behaviour, specifically around being able to tweak settings on minimum hyphenation length, minimum hyphenation length before/after the line break, or adding exceptions, `hypher` allows one to do that.

There are [CSS proposals](https://www.w3.org/TR/css-text-4/#hyphenation) in the pipeline for specifying some of these, but until we get there, `hypher` will do the job nicely.

## Install

`npm install --save gatsby-remark-hypher`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [`gatsby-remark-hypher`],
    },
  },
]
```

Then make sure you have the `hyphens` CSS rule for `p` set to either `manual` (which is the default value) or `auto` (in which case the browser will respect the soft breaks inserted by `hypher` over its own automatic behaviour):

### Options

Valid `hypher` options may be passed to the plugin. For example:

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        {
          resolve: "gatsby-remark-hypher",
          options: {
            language: require('hyphenation.en-gb'),
            leftMin: 3,
            rightMin: 2,
            exceptions: "comma,separated,strings,exceptions",
            minLength: 6,
          },
        },
      ],
    },
  },
]
```

For more information on the options, please refer to the [hypher documentation].

#### Custom language object

The default language object used is `hyphenation.en-us`, which you can see the settings for [here](https://github.com/bramstein/hyphenation-patterns/blob/master/patterns/en-us.js).

`gatsby-remark-hypher` allows you to specify a custom language object using `options.language`. You may choose one from [hyphenation-patterns](https://github.com/bramstein/hyphenation-patterns), or supply your own one.

`leftMin`, `rightMin`, `exceptions`, and `minLength`, if specified, will take precedence over the settings in the language object.

