---
title: Sourcing Content from JSON or YAML
---

## Table of Contents

- [Introduction](#Introduction)
- [Setup](#Setup)
- [YAML example](#YAML-example)
- [JSON example](#JSON-example)
- [Joining the pieces](#Joining-the-pieces)

## Introduction

As you come across Gatsby and start discovering the extent of its possibilities, sometimes you might wonder about basic things like importing a JSON file or a YAML file directly into a page. And that's what you'll build while following this small tutorial!

## Prerequisites

Before we go through the details and code, you should be familiar with the basics of Gatsby.

Check out the [tutorial](/tutorial/) and brush up on the [documentation](/docs/).
In addition to this, some knowledge of [ES6 syntax](https://medium.freecodecamp.org/write-less-do-more-with-javascript-es6-5fd4a8e50ee2) will be useful.

Otherwise just skip this part and move onto the next part.

## Setup

You'll start by creating a new Gatsby website based on the official _hello world starter_.

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

## YAML example

This tutorial starts with sourcing content from a YAML file. If you want to see how to do it using JSON instead, jump to the [next section](#JSON-example).

### Adding the YAML content

Create a folder called `content` and inside, add a file called `My-YAML-Content.yaml` with the following content inside:

```yml
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
  - item: 192.33
  - item: 111111
```

### Importing YAML into the page component

Now that you have something you want to show, the only thing missing is to create a page that will consume the data.

Add a new file called `yml-at-buildtime.js` inside the `pages` folder, with the following code:

```javascript
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

The above code imports YAML source data and renders it in a functional stateless React component with Gatsby. Without any extra configuration, it will display a page sourced from a YAML file.

## JSON example

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

```javascript
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

Once again: out of the box and without any extra configuration, the page will show the content.

## Joining the pieces

After all these steps are complete, you should have the following file and folder structure:

```
  |gatsby-YAML-JSON-at-buildtime
    |content
      - My-YAML-Content.yaml or - My-JSON-Content.json
    |src
      |pages
        - index.js
        - json-at-buildtime.js or - yml-at-buildtime.js
        - 404.js
```

Running `gatsby develop` in the terminal and opening a browser window to `http://localhost:8000/json-at-buildtime/` or `http://localhost:8000/yml-at-buildtime`, you'll see the results of this small tutorial.

To make this work on your existing Gatsby site:

- For JSON, copy over the file contents of `json-at-buildtime.js` : https://github.com/gatsbyjs/gatsby/examples/using-gatsby-with-json-yaml/src/pages/json-at-buildtime.js and corresponding JSON file https://github.com/gatsbyjs/gatsby/examples/using-gatsby-with-json-yaml/content/My-JSON-Content.json

- For YAML, copy over the file contents of `yml-at-buildtime.js`: https://github.com/gatsbyjs/gatsby/examples/using-gatsby-with-json-yaml/src/pages/yml-at-buildtime.js and corresponding YAML file https://github.com/gatsbyjs/gatsby/examples/using-gatsby-with-json-yaml/content/My-YAML-Content.yaml
