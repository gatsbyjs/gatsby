---
title: Sourcing Content from JSON or YAML
---

## Table of Contents

- [Introduction](#Introduction)
- [Setup](#Setup)
- [Directly importing data with YAML](#Directly-importing-data-with-YAML)
- [Directly importing data with JSON](#Directly-importing-data-with-JSON)
- [Building a Gatsby site sourced from YAML](#Building-a-Gatsby-site-sourced-from-YAML)
- [Adding necessary dependencies](#Adding-necessary-dependencies)
- [Adding Content](#Adding-some-content)
- [Gatsby Config](#Gatsby-configuration)
- [Gatsby Template](#Gatsby-Template)
- [Joining the pieces](#Joining-the-pieces)
- [Using Gatsby without GraphQL](https://www.gatsbyjs.org/docs/using-gatsby-without-graphql/)

## Introduction

As you come across Gatsby and start discovering the extent of it's possibilities, sometimes you might wonder about the basic things.

Things like how to import a JSON file or a YAML file directly into a page or a component.

Or even how to create a Gatsby site directly from a YAML file.

And that's what you'll build while following this tutorial.

## Prerequisites

Before we go through the details and code, you should be familiar with the basics of Gatsby.

Check out the [tutorial](https://www.gatsbyjs.org/tutorial/) and brush up on the [documentation](https://www.gatsbyjs.org/docs/).
In addition to this, some knowledge of [ES6 syntax](https://medium.freecodecamp.org/write-less-do-more-with-javascript-es6-5fd4a8e50ee2) will be useful.

Otherwise just skip this part and move onto the next part.

## Setup

You'll start by creating a new Gatsby site based on the official _hello world starter_.

Open up a terminal and run the following command.

```bash
gatsby new gatsby-YAML-JSON-at-buildtime https://github.com/gatsbyjs/gatsby-starter-hello-world
```

After the process is complete, some additional packages are needed.

Change directories to the newly created Gatsby website and issue the following command:

```bash
npm install --save uuid
```

This package is used to ensure uniqueness with React prop keys.

## Directly importing data with YAML

Starting from YAML, if you want to see how to do it using JSON, instead jump to the [next section](#Directly-importing-data-with-JSON).

### Adding the YAML content

Create a folder called `content` and inside, add a file called `My-YAML-Content.yaml` with the following content inside:

```yaml
title: YAML content used at build time with Gatsby
content:
  - item:
      Cupcake ipsum dolor. Sit amet marshmallow topping cheesecake muffin. Halvah
      croissant candy canes bonbon candy. Apple pie jelly beans topping carrot cake
      danish tart cake cheesecake. Muffin danish chocolate soufflé pastry icing bonbon
      oat cake. Powder cake jujubes oat cake. Lemon drops tootsie roll marshmallow halvah
      carrot cake.
  - item:
      Spicy jalapeno bacon ipsum dolor amet t-bone burgdoggen short loin kevin flank.
      Filet mignon frankfurter spare ribs, sausage corned beef picanha beef ribs pork belly kevin cupim porchetta alcatra hamburger.
      Picanha brisket shankle buffalo tri-tip. Doner prosciutto meatloaf ribeye kevin kielbasa jowl beef ribs flank burgdoggen venison.
      Does your lorem ipsum text long for something a little meatier? Give our generator a try… it’s tasty!
  - item: 192.33
  - item: 111111
```

### Importing YAML into the page component

Now that you have something you want to show, the only thing missing is to create a page that will consume the data.

Add a new file called `yml-at-buildtime.js` inside the `pages` folder, with the following code:

```jsx:title=src/pages/yml-at-buildtime.js
import React from "react"
import uuid from "uuid"
import YAMLData from "../../content/My-YAML-Content.yaml"

const YAMLbuildtime = () => (
  <div style={{ maxWidth: `960px`, margin: `1.45rem` }}>
    <h1>{YAMLData.title}</h1>
    <ul>
      {YAMLData.content.map(data => {
        return <li key={`content_item_${uuid.v4()}`}>{data.item}</li>
      })}
    </ul>
  </div>
)
export default YAMLbuildtime
```

The above code imports YAML source data and renders it in a functional stateless React component, that when rendered by Gatsby, and without any extra configuration will display a page sourced from a YAML file.

## Directly importing data with JSON

In this part you'll use JSON as a datasource.

### Adding the JSON content

Create a folder named `content` if it doesn't exist, and then add a new file inside called `My-JSON-Content.json` with the following content inside:

```json
{
  "title": "JSON content used at build time with Gatsby",
  "content": [
    {
      "item": "Cupcake ipsum dolor. Sit amet marshmallow topping cheesecake muffin. Halvah croissant candy canes bonbon candy. Apple pie jelly beans topping carrot cake danish tart cake cheesecake. Muffin danish chocolate soufflé pastry icing bonbon oat cake. Powder cake jujubes oat cake. Lemon drops tootsie roll marshmallow halvah carrot cake."
    },
    {
      "item": "Spicy jalapeno bacon ipsum dolor amet t-bone burgdoggen short loin kevin flank.
      Filet mignon frankfurter spare ribs, sausage corned beef picanha beef ribs pork belly kevin cupim porchetta alcatra hamburger.
      Picanha brisket shankle buffalo tri-tip. Doner prosciutto meatloaf ribeye kevin kielbasa jowl beef ribs flank burgdoggen venison.
      Does your lorem ipsum text long for something a little meatier? Give our generator a try… it’s tasty!"
    },
    {
      "item": 192.33
    },
    {
      "item": 111111
    }
  ]
}
```

### Importing JSON into the page component

Now that you have something that needs to be shown, all that's missing is a page to show it.

Add a new file called `json-at-buildtime.js` inside the `pages` folder with the following code:

```jsx:title=src/pages/json-at-buildtime.js
import React from "react"
import uuid from "uuid"
import JSONData from "../../content/My-JSON-Content.json"

const JSONbuildtime = () => (
  <div style={{ maxWidth: `960px`, margin: `1.45rem` }}>
    <h1>{JSONData.title}</h1>
    <ul>
      {JSONData.content.map(data => {
        return <li key={`content_item_${uuid.v4()}`}>{data.item}</li>
      })}
    </ul>
  </div>
)
export default JSONbuildtime
```

The only thing different in this case, is the file import. Instead of the YAML file, this time you're importing directly a JSON file into the page component.

Once again out of the box and without any extra configuration the page will show the content.

## Building a Gatsby site sourced from YAML

In this section of the tutorial it will be described how it's possible to create a fully functional Gatsby site that's sourced from a YAML file.

### Adding necessary dependencies

Before proceeding you will need to add a extra dependency so that the file containing the site structure and it's contents can be loaded and interpreted safely.

Assuming you followed the steps described in the setup section of this tutorial.

Open a new terminal and navigate to the folder containing the Gatsby site and issue the following command:

```bash
npm install --save js-yaml
```

This newly added package will be responsible for loading and parsing the YAML file safely.

### Adding some content

Create a folder named `content` if it doesn't exist, and then add a new file inside called `index.yaml` with the following contents:

```yaml
- path: "/page1"
  content:
    - item: one item
    - item: two items
    - item: three items
  links:
    - to: "/page2"
    - to: "/page5"
- path: "/page2"
  content:
    - item:
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
        eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt
        in culpa qui officia deserunt mollit anim id est laborum.
  links:
    - to: "/page1"
- path: "/page3"
  content:
    - item: Cupcake ipsum dolor sit amet tootsie roll sesame snaps chupa chups.
        Sugar plum chupa chups topping I love carrot cake I love marshmallow dessert.
        Toffee gingerbread pie apple pie jelly beans pastry cookie.
        Lemon drops wafer I love pastry halvah dragée pudding cake.
        Cake halvah cookie jelly beans topping pudding cheesecake donut.
        Cake croissant marshmallow.
        Sesame snaps apple pie I love I love cake danish powder.
        Lollipop sweet caramels.
        Tiramisu danish marshmallow candy canes.
        Powder cupcake cotton candy bonbon chocolate bar marshmallow gummies cheesecake marzipan.
        Gummies soufflé candy. Candy canes muffin chocolate brownie pudding.
  links: []
- path: "/page4"
  content:
    - item:
        Lorem ipsum dolor amet mustache knausgaard +1, blue bottle waistcoat tbh
        semiotics artisan synth stumptown gastropub swag. Brunch raclette
        vexillologist post-ironic glossier ennui milkshake godard pour-over blog tumblr
        humblebrag. Blue bottle put a bird on it twee prism biodiesel brooklyn. Blue
        bottle ennui tbh succulents.
  links:
    - to: "/page5"
    - to: "/page1"
- path: "/page5"
  content:
    - item: St. agur blue cheese queso cheesecake.
        Cheesecake the big cheese monterey jack cheesecake monterey jack paneer halloumi rubber cheese.
        Cheese triangles cheese strings cheese slices cheesy feet taleggio cottage cheese when the cheese comes out everybody's happy gouda.
        Feta cauliflower cheese babybel cheese on toast monterey jack.
    - item:
        Bacon ipsum dolor amet short ribs brisket venison rump drumstick pig sausage
        prosciutto chicken spare ribs salami picanha doner. Kevin capicola sausage,
        buffalo bresaola venison turkey shoulder picanha ham pork tri-tip meatball meatloaf
        ribeye. Doner spare ribs andouille bacon sausage. Ground round jerky brisket
        pastrami shank.
  links:
    - to: "/page1"
```

The code block above creates a YAML object in which:

- Each `path` is a page's endpoint (the relevant part of its URL).
- The `contents` list holds some data to be displayed.
- The `links` list holds some endpoints to other pages.

### Gatsby configuration

Now that the site structure and contents exists, we need to tell Gatsby to generate the appropriate pages and display the contents for each one.

If you don't have one, create the `gatsby-node.js` file with the following code inside:

```jsx:title=gatsby-node.js
const fs = require("fs")
const yaml = require("js-yaml")
exports.createPages = ({ actions }) => {
  const { createPage } = actions
  const ymlDoc = yaml.safeLoad(fs.readFileSync("./content/index.yaml", "utf-8"))
  ymlDoc.forEach(element => {
    createPage({
      path: element.path,
      component: require.resolve("./src/templates/basicTemplate.js"),
      context: {
        pageContent: element.content,
        links: element.links,
      },
    })
  })
}
```

Breaking down this code excerpt into smaller parts:

1. The `js-yaml` package installed earlier is imported.
2. The `index.yaml` file is loaded and the content parsed.
3. Through the use of Gatsby's [`createPage()` API](/docs/actions/#createPage), the parsed file will be used to create some pages programmatically.
4. The `context` property will pass your data into the page as a special prop named `pageContext`, allowing it to be consumed. You can read more about `context` in [creating and modifying pages](/docs/creating-and-modifying-pages/).

### Review of the steps so far

Doing a quick review of what you have done so far:

1. Created a new Gatsby website based on a starter.
2. Added some dependencies to safely load and parse a YAML file.
3. Created the file and folder structure to house the contents to be displayed.
4. Extended Gatsby's default configuration through `gatsby-node.js` to fetch the data and create some pages programmatically at build time.

### Gatsby template

The last step needed is to create a template that will host the content.

Create a file called `basicTemplate.js` in the `src/templates/` folder and add the following:

```jsx:title=src/templates/basicTemplate.js
import React from "react"
import uuid from "uuid"
import { Link } from "gatsby"
const basicTemplate = props => {
  const { pageContext } = props
  const { pageContent, links } = pageContext

  return (
    <div style={{ maxWidth: `960px`, margin: `1.45rem` }}>
      <ul>
        {pageContent.map(data => {
          return <li key={uuid.v4()}>{data.item}</li>
        })}
      </ul>
      <ul>
        {links.map(item => {
          return (
            <li key={uuid.v4()}>
              <Link to={item.to}>{item.to}</Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
export default basicTemplate
```

### Joining the pieces

After all these steps are complete, you should have the following file and folder structure:

```
  |gatsby-YAML-JSON-at-buildtime
    |content
      - index.yaml
    |src
      |templates
        - basicTemplate.js
    - gatsby-node.js
```

Running `gatsby develop` in the terminal and opening a browser window to `http://localhost:8000/page1` you'll see a page with content that was sourced from a YAML file used to generate your site.

To make this work on your existing Gatsby site, you would need to:

- Copy over the `gatsby-node.js` file contents: https://github.com/gatsbyjs/gatsby/examples/using-gatsby-with-json-yaml/gatsby-node.js
- Create a basic template: https://github.com/gatsbyjs/gatsby/examples/using-gatsby-with-json-yaml/src/templates/basicTemplate.js
- And grab the YAML file: https://github.com/gatsbyjs/gatsby/examples/using-gatsby-with-json-yaml/content/index.yaml
