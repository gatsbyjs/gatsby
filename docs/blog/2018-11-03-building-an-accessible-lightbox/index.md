---
title: "Building a custom, accessible image lightbox"
date: 2018-12-20
author: "Sergiy Dybskiy"
tags: ["lightbox", "gatsby-image", "accessibility"]
canonicalLink: "https://416serg.me/building-a-custom-accessible-image-lightbox-in-gatsbyjs"
---

In this tutorial you're going to cover the steps to creating a simple, custom, accessible image lightbox inside a [GatsbyJS](/) application. You can check out the finished example on [GitHub](https://github.com/416serg/GatsbyLightbox) ([Demo](https://gatsbylightboxv2.416serg.me/)) or continue reading to dive right into the magic.

## Getting started

If you don't have Gatsby installed, open up your terminal and type in:

```terminal
$ npm install --global gatsby-cli
```

Then, still in your Terminal, head over to a folder you'd want to get started in and type in:

```terminal
$ gatsby new GatsbyLightbox https://github.com/gatsbyjs/gatsby-starter-default
```

Once it's done scaffolding the starter application, type in:

```terminal
$ cd GatsbyLightbox
$ yarn develop
```

Now open up your browser to `localhost:8000` and you should see the starter application ready to go.

![Gatsby Starter Screenshot](/screen-4.png)

Open up your favorite code editor to start setting stuff up.

## Gatsby Image

Dealing with images on the web has always been an issue. You have to have the right sizes, you have to have the right formats, if something is too big, it will load slowly, etc. Luckily, Gatsby built a plugin to handle images elegantly called [`gatsby-image`](https://www.npmjs.com/package/gatsby-image). Using Gatsby's GraphQL queries, you can request different sizes, formats and have a few options as to how you want to handle the image load. For this tutorial you'll be using a blur up approach, similar to how Medium handles their images.

If you open up the `index.js` file in the pages folder, you'll see there is an `<Image/>` component that does exactly that.

You'll take a similar approach.

### Configure `gatsby-config.js`

You'll put all of the images in a folder inside `src/cars` (You can get them from the [GitHub repo](https://github.com/416serg/GatsbyLightbox/tree/master/src/cars) or use your own, just make sure to follow a similar format). Then, you'll edit the `gatsby-config.js` file to expose that folder to a GraphQL query.

```js
{
  resolve: `gatsby-source-filesystem`,
  options: {
    name: `cars`,
    path: `${__dirname}/src/cars`,
  },
},
```

Add that under the existing filesystem config and then restart your Gatsby server (I believe it's necessary for it to build the query before calling it).

### Creating a `Cars` component

Now that you have configured the filesystem, go ahead and create a component that will request all the images with a GraphQL query.

Create a new file inside `src/components` called `cars.js`.

```js
import React from "react"
import { StaticQuery, graphql } from "gatsby"
import Lightbox from "./lightbox"

const Cars = () => (
  <StaticQuery
    query={graphql`
      query {
        carImages: allFile(filter: { sourceInstanceName: { eq: "cars" } }) {
          edges {
            node {
              childImageSharp {
                fluid(maxWidth: 2000) {
                  ...GatsbyImageSharpFluid
                }
              }
            }
          }
        }
      }
    `}
    render={data => <Lightbox carImages={data.carImages.edges} />}
  />
)
export default Cars
```

Notice how the `StaticQuery` component is using a render prop where it's returning your `Lightbox` component. For now, it's a simple component inside `components/lightbox.js` that looks like this:

```js
import React, { Component } from "react"
import PropTypes from "prop-types"
import Img from "gatsby-image"

export default class Lightbox extends Component {
  static propTypes = {
    carImages: PropTypes.array.isRequired,
  }

  render() {
    const { carImages } = this.props
    return (
      <div>
        {carImages.map(image => (
          <Img
            key={image.node.childImageSharp.fluid.src}
            fluid={image.node.childImageSharp.fluid}
          />
        ))}
      </div>
    )
  }
}
```

By now, you should have all the images displaying on the home page and doing a fade-up load.

### Styled Components

For styling, you're going to be using [styled-components](https://www.styled-components.com/). To get it configured with Gatsby, run the following inside your terminal in your application:

```terminal
$ yarn add gatsby-plugin-styled-components styled-components babel-plugin-styled-components
```

And add the following to `gatsby-config.js`:

```js
module.exports = {
  /* existing config */
  plugins: [
    `gatsby-plugin-styled-components`,
    /* existing plugins */
  ],
}
```

Lets restart the application to make sure the config has taken its effect. Now, you're going to create a simple `LightboxContainer` styled component to wrap your images in. Your `lightbox.js` component should look like this now:

```js
import React, { Component } from "react"
import PropTypes from "prop-types"
import Img from "gatsby-image"
import styled from "styled-components"

const LightboxContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 5px;
`

export default class Lightbox extends Component {
  static propTypes = {
    carImages: PropTypes.array.isRequired, // eslint-disable-line
  }

  static state = {
    open: false,
  }

  render() {
    const { carImages } = this.props
    return (
      <LightboxContainer>
        {carImages.map(image => (
          <Img
            key={image.node.childImageSharp.fluid.src}
            fluid={image.node.childImageSharp.fluid}
          />
        ))}
      </LightboxContainer>
    )
  }
}
```

Now the page should look something like this:

![Displaying images on the home page](/screen-3.png)

### Creating the Lightbox

For the sake of accessibility, you'll be using [Dialog](https://ui.reach.tech/dialog) from Reach UI - shout out to [Ryan Florence](https://github.com/ryanflorence) for making awesome, accessible tools for React. As a side note, Gatsby's router is using [`@reach/router`](https://reach.tech/router) under the hood, so you're keeping it in the family 😉

Go ahead and install all the dependencies:

```terminal
$ yarn add @reach/dialog
```

And configure a basic dialog inside the `Lightbox` component.

```js
import React, { Component, Fragment } from "react"
import PropTypes from "prop-types"
import Img from "gatsby-image"
import styled from "styled-components"
import { Dialog } from "@reach/dialog"
import "@reach/dialog/styles.css"

const LightboxContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 5px;
`

export default class Lightbox extends Component {
  static propTypes = {
    carImages: PropTypes.array.isRequired, // eslint-disable-line
  }

  constructor(props) {
    super(props)

    this.state = {
      showLightbox: false,
    }
  }

  render() {
    const { carImages } = this.props
    const { showLightbox } = this.state
    return (
      <Fragment>
        <LightboxContainer>
          {carImages.map(image => (
            <Img
              key={image.node.childImageSharp.fluid.src}
              fluid={image.node.childImageSharp.fluid}
            />
          ))}
        </LightboxContainer>
        <button
          type="button"
          onClick={() => this.setState({ showLightbox: true })}
        >
          Show Dialog
        </button>
        {showLightbox && (
          <Dialog>
            <p>Image will go here</p>
            <button
              type="button"
              onClick={() => this.setState({ showLightbox: false })}
            >
              Clos
            </button>
          </Dialog>
        )}
      </Fragment>
    )
  }
}
```

Now, when you click the `Show Dialog` button, you should see something like this:

![Basic Dialog implementation](/screen-2.png)

### Connecting the image click to the Lightbox

Now, you're going to convert each `Img` component into a button that you can click that will trigger the lightbox to open up with the right image selected. Here's how you do that:

```js
import React, { Component, Fragment } from "react"
import PropTypes from "prop-types"
import Img from "gatsby-image"
import styled from "styled-components"
import { Dialog } from "@reach/dialog"
import "@reach/dialog/styles.css"

const LightboxContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 5px;
`

const PreviewButton = styled.button`
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
`

export default class Lightbox extends Component {
  static propTypes = {
    carImages: PropTypes.array.isRequired, // eslint-disable-line
  }

  constructor(props) {
    super(props)

    this.state = {
      showLightbox: false,
      selectedImage: null,
    }
  }

  render() {
    const { carImages } = this.props
    const { selectedImage, showLightbox } = this.state
    return (
      <Fragment>
        <LightboxContainer>
          {carImages.map(image => (
            <PreviewButton
              key={image.node.childImageSharp.fluid.src}
              type="button"
              onClick={() =>
                this.setState({ showLightbox: true, selectedImage: image })
              }
            >
              <Img fluid={image.node.childImageSharp.fluid} />
            </PreviewButton>
          ))}
        </LightboxContainer>
        {showLightbox && (
          <Dialog>
            <Img fluid={selectedImage.node.childImageSharp.fluid} />
            <button
              type="button"
              onClick={() => this.setState({ showLightbox: false })}
            >
              Close
            </button>
          </Dialog>
        )}
      </Fragment>
    )
  }
}
```

Now, if you click on one of the images, it should look something like this:

![Final Lightbox](/screen-1.png)

Now you can go ahead and implement this in your e-commerce store, picture gallery, or anywhere else you might see fit 😃

Feel free to [tweet me](https://twitter.com/416serg) if you have any questions, comments, requests or just want to show some ❤️.
