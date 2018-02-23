# Gatsby SQIP plugin

Generates vectorized primitive version of images to be used as preview thumbnails.


## :cloud: Installation

1. Install Golang (https://golang.org/doc/install)
2. Install primitive (`go get -u github.com/fogleman/primitive`)
3. Enable the plugin in your gatsby config

## :hand: Usage

### GraphQL
```graphql
image {
  sqip(numberOfPrimitives: 3, blur: 0),
  resolutions {
    ...GatsbyContentfulResolutions_withWebp_noBase64
  }
}
```

### React
```jsx
const Img = require(`gatsby-image`)

<Img
  resolutions={{
    ...image.resolutions,
    base64: image.sqip
  }}
/>
```
