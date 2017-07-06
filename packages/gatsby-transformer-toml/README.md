# gatsby-transformer-toml

Parses TOML files.

## Install

`npm install --save gatsby-transformer-toml`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  `gatsby-transformer-toml`,
]
```

## Parsing algorithm

This plugin is using NPM [toml](https://www.npmjs.com/package/toml) package to parse TOML documents.
As long as your TOML is valid, you shouldn't have any issues.

Live demo of TOML to JSON conversion using [toml](https://www.npmjs.com/package/toml) is [here](http://binarymuse.github.io/toml-node/).

If you have `user.toml` in you project, with contents like this:

```toml
userName = "Random User"
userAvatar = "https://api.adorable.io/avatars/150/test.png"
userDescription = "Lorem..."
[userLink]
     label='Website'
     url='//mywebsite.example.local'
     icon='fa fa-link'
```

Then you'll be able to query your data using:

```graphql
query MyQuery {
  userToml {
    userName
    userAvatar
    userDescription
    userLink {
      label
      url
      icon
    }
  }
}

```

And the result will be:

```javascript
{
  "data": {
    "userToml": {
      "userName": "Random User",
      "userAvatar": "https://api.adorable.io/avatars/150/test.png",
      "userDescription": "Lorem...",
      "userLink": {
        "label": "Website",
        "url": "//mywebsite.example.local",
        "icon": "fa fa-link"
      }
    }
  }
}
```
