# Gatsby SQIP plugin

Generates vectorized primitive version of images to be used as preview thumbnails.

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

#### Pure HTML

Coming soon. Doing some preparations first.

#### Gatsby Image
```jsx
const Img = require(`gatsby-image`)

<Img
  resolutions={{
    ...image.resolutions,
    base64: image.sqip
  }}
/>
```
