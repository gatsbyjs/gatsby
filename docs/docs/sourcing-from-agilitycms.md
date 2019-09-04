---
title: Sourcing from Agility CMS
---

This guide takes you through the steps involved in setting up a Gatsby site that fetches content from [Agility CMS](https://agilitycms.com/).

## What is Agility CMS? What makes it different?

[Agility CMS](https://agilitycms.com/) is a headless Content Management System (CMS) that let's you easily define your custom content types and relationships easily.  This is called Content Architecture, and you can reuse this content for your websites and apps.

In addition, Agility CMS provides a page routing API, which allows you to offload control of the sitemap to the content editors.

All content is available through the Agility CMS Fetch or Preview API.


## Getting Started

### Create A Free Agility Account
It only takes a minute to create an Agility CMS account, and it's free forever. [Sign up here](https://account.agilitycms.com/sign-up?product=agility-free).  

Once your account is created, we'll need to grab your GUID and API Keys.

### Get the Code

Make sure you have Gatsby CLI tools installed (we are using npm here...)
```
npm install -g gatsby-cli
```

Go ahead and clone the Agility CMS Gatsby Starter repo on from GitHub that has all the code you need to get started.
```
git clone https://github.com/agility/agility-gatsby-starter.git
```

Resolve any dependencies

```
npm install
```

Run it in development mode!
```
gatsby develop
```

The site is just a starter, but it has a bunch of interesting features that you can use to build from.  Let's hook this code up to your new Agility CMS instance that you just created.

## Hook it up to your Agility CMS instance
Edit the **gatsby-config.js** file and repace the *guid* and *apiKey* with yours.  

You can find your API keys on the Getting Started page in the Agility Content Manager.


![Agility CMS - Dashboard - API Keys](./images/agilitycms-api-keys.png)

If you use the "preview" key, you won't have to publish to see the changes you've made show up. If you use the "fetch" key, make sure you've published any content you wish to see changed.

## How Does It Work

The Gatsby Source Plugin downloads all the Pages on the Agility CMS Sitemap, as well as any Shared Content that's referenced on the *sharedContent* property on of the gatsby-config.js file.

All of those pages and content are then made available in GraphQL to the React Components you will write to render those pages.

Check out the component called "Jumbotron".  This is an example of how to a heading and sub-heading with content that comes from Agility CMS.  Here is the Module that provides this content being edited in the Agility CMS Content Manager:

![Agility CMS - Example Module - Jumbotron](./images/agilitycms-jumbotron.png)


And here is the code used to render it.  Notice that the *title* and *subTitle* fields are available as properties the *item.fields* object.

``` javascript
import React, { Component } from 'react';
import { graphql, StaticQuery } from "gatsby"

import './Jumbotron.css'

export default class Jumbotron extends Component {
    render() {    
        return (
            <section className="jumbotron">
                <h1>{this.props.item.fields.title}</h1>
                <h2>{this.props.item.fields.subTitle}</h2>
            </section>
        );
    }
}
```

When we add new modules and content definitions to Agility, the components we use to render those modules will automatically get the strongly typed data delivered to those modules as props.  
