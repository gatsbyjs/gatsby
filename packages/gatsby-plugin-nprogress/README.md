# gatsby-plugin-nprogress

Automatically shows the [nprogress](http://ricostacruz.com/nprogress/) indicator
when a page is delayed in loading (which Gatsby considers as one second after
clicking on a link).

## Install

`npm install --save gatsby-plugin-nprogress`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-nprogress`,
    options: {
      // Setting a color is optional.
      color: `tomato`,
    }
  }
]
```
