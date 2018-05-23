---
title: Familiarize with Gatsby Building Blocks
typora-copy-images-to: ./
---

In the [previous section](/tutorial/part-zero/), we got our development environment all ready to go by installing different software and scaffolding out our first Gatsby site using the [“hello world” starter](https://github.com/gatsbyjs/gatsby-starter-hello-world). Now we’re going to take a deeper dive into what exactly the [Gatsby](https://github.com/gatsbyjs/gatsby-starter-default)’s [default starter](https://github.com/gatsbyjs/gatsby-starter-default) gives us.

## Gatsby’s default starter

In the previous section, we created a site based on the “hello world” starter using the following command:

`gatsby new hello-world https://github.com/gatsbyjs/gatsby-starter-hello-world`

When creating a new Gatsby site, you can use the following command structure to create a new site based on any existing Gatsby starter:

`gatsby new [SITE_DIRECTORY] [URL_OF_STARTER_GITHUB_REPO]`

> 💡 See a list of the existing [official and community starters](/docs/gatsby-starters/)!

If you omit a URL from the end, Gatsby will automatically generate a site for you based on the [default starter](https://github.com/gatsbyjs/gatsby-starter-default). Let’s do that now, to create a new site with the default starter, and explore the output.

### ✋ Generate a new site based on Gatsby’s default starter

1. Open up your terminal. 
2. Run `gatsby new my-tutorial-site`.
3. Run `cd my-tutorial-site`.
4. Run `gatsby develop`.

This process should look familiar — it’s almost exactly what we did in the last section to scaffold out the "hello world" site. But this time, because we’re using a different starter, when you visit [http://localhost:8000](http://localhost:8000/) things will look a little different:

![](https://d2mxuefqeaa7sj.cloudfront.net/s_E618395E4841D470F48D0AACF52A3EBAEA74345E0FB4AC285CBC937727755E20_1520719644125_Screen+Shot+2018-03-07+at+11.00.28+PM.png)


Let’s take a look at the code we’ve just generated.

## Gatsby’s project structure
### ✋ Open up the code using your editor of choice.

You should see something like this:

![](https://d2mxuefqeaa7sj.cloudfront.net/s_E618395E4841D470F48D0AACF52A3EBAEA74345E0FB4AC285CBC937727755E20_1522382930687_Screen+Shot+2018-03-29+at+11.06.11+PM.png)


*Note: The editor shown here is Visual Studio. If you’re using a different editor, it will look a little different.*

Below, we've listed each top-level files and directories you see in the default project directory. The main pieces we’ll be concerned with for this piece of the tutorial are the `src` directory and the `gatsby-config.js` file.

> 💡 For a high-level definiton of each piece, see the [page on Gatsby's project file structure](/docs/gatsby-project-structure/).

1. `/node_modules`
2. **`/src`**: This directory will contain all of the code related to what you will see on the front-end of your site (what you see in the browser), like your site header, or a page template. “Src” is a convention for “source code”.
3. `.gitignore`
4. `.prettierrc`
5. `gatsby-browser.js`
6. **`gatsby-config.js`**: This is the main configuration file for a Gatsby site. This is where you can specify information about your site (metadata) like the site title and description, which Gatsby plugins you’d like to include, etc. (Check out the [config docs](/docs/gatsby-config/) for more detail).
7. `gatsby-node.js`
8. `gatsby-ssr.js`
9. `LICENSE`
10. `package-lock.json`
11. `package.json`
12. `README.md`
13. `yarn.lock`

Now that our site is up and running (at http://localhost:8000/), and we have been introduced to the files and directories that are powering it, let’s start exploring the starter code. (*Reminder, if you're not able to see your site running locally, make sure you've started running the development server with `gatsby develop`!*)

## Meet pages: The starter homepage

Open up the `/src` directory in your code editor.

Inside are three more directories -- `/components`, `/layouts`, and `/pages`. Open the file at `/src/pages/index.js`. The code in this file creates a component that contains the level-one header, two paragraphs, and link you see in the main content area of the starter homepage.

### ✋ Make changes to the page markup
1. Change some of the words, and edit the code on line 5 to add a border to the main div (see below), and save the file:


![](https://d2mxuefqeaa7sj.cloudfront.net/s_E618395E4841D470F48D0AACF52A3EBAEA74345E0FB4AC285CBC937727755E20_1522460558137_gatsby1.gif)


If your windows are side-by-side, you can see that your code and content changes are reflected almost instantly in the browser, once you save the file.

### 💡 Hot reloading
Gatsby uses "hot reloading" to speed up your development process. Essentially, when you're running a Gatsby development server, the Gatsby site files are being "watched" in the background -- any time you save changes to a file, your changes will be immediately reflected in the browser, without refreshing the page!

### 💡 Wait… HTML in our JavaScript?

*If you’re familiar with React and JSX, feel free to skip this section.* If you haven’t worked with the React framework before, you may be wondering what HTML is doing in a JavaScript function. Or why we’re importing `react` but not using it anywhere. This hybrid “HTML-in-JS” is actually a syntax extension of JavaScript, for React, called JSX. You can follow along this tutorial without prior experience with React, but if you’re curious, here’s a brief primer…

This is the JSX from the starter `/src/pages/index.js` file:


    import React from 'react'
    import Link from 'gatsby-link'
    const IndexPage = () => (
      <div>
        <h1>Hi people</h1>
        <p>Welcome to your new Gatsby site.</p>
        <p>Now go build something great.</p>
        <Link to="/page-2/">Go to page 2</Link>
      </div>
    )
    export default IndexPage

In pure JavaScript, it looks more like this:


    import React from 'react';
    import Link from 'gatsby-link';
    
    const IndexPage = () => React.createElement(
      'div',
      null,
      React.createElement(
        'h1',
        null,
        'Hi people'
      ),
      React.createElement(
        'p',
        null,
        'Welcome to your new Gatsby site.'
      ),
      React.createElement(
        'p',
        null,
        'Now go build something great.'
      ),
      React.createElement(
        Link,
        { to: '/page-2/' },
        'Go to page 2'
      )
    );
    
    export default IndexPage;

(Now you can spot the use of the `'react'` import on several lines in the snippet above!) But wait. We’re writing JSX, right? How does the browser read that? The short answer: It doesn’t. Gatsby sites comes with tooling already set up to convert your source code into backward-compatible code that different browsers can reliably interpret. 

## Meet components: The starter header

If `/src/pages/index.js` generated our homepage, then where was our purple “Gatsby” header?

1. Open up `/src/components/Header/index.js`.
2. On line 7, change `rebeccapurple` to `teal`, and, as in the “Meet `/pages`" section, add a border to the main div: `border: '6px dashed LightCoral'`.

![](https://d2mxuefqeaa7sj.cloudfront.net/s_E618395E4841D470F48D0AACF52A3EBAEA74345E0FB4AC285CBC937727755E20_1522526490724_gatsby-header.gif)


We found our header! But how did the content defined in these two separate files end up on the homepage?

## Meet layouts: The starter default layout

1. Open up `/src/layouts/index.js`. In this file, we are exporting a function called “TemplateWrapper”.
2. Edit the main div on line 9 to add a border here, too — `border: '4px solid black'` — and save.

![](https://d2mxuefqeaa7sj.cloudfront.net/s_E618395E4841D470F48D0AACF52A3EBAEA74345E0FB4AC285CBC937727755E20_1522527607495_gatsby-layout.gif)


Alright! This file is defining a component in that wraps our header component and page content. Components like these-- layout components -- define sections of your site that you want to share across multiple pages. Gatsby sites will, for example, commonly define a layout component with a shared header, footer, navigation menu, etc. By default, all pages in your Gatsby site will use the layout defined at `/layouts/index.js`.

On line five, we’re importing the header component from  `../components/Header`, and on line 21, we’re including it by using a self-closing JSX tag, `<Header />`. This is why we see the header component on the homepage, even though at first perhaps it seemed like it was missing from our homepage file (`/src/pages/index.js`).

Below, I’ve opened up our [homepage](http://localhost:8000/) and [page 2](http://localhost:8000/page-2/) in separate browser windows, and the header component in my code editor. If we modify the default header text (“Gatsby”) and save the file, we’ll see the text change immediately reflected on both pages. 

![](https://d2mxuefqeaa7sj.cloudfront.net/s_E618395E4841D470F48D0AACF52A3EBAEA74345E0FB4AC285CBC937727755E20_1522600157911_gatsby-header2.gif)


That’s the header. Where’s the page content? On line 28, you’ll see `{children()}`. What?

## What are React “props”?

We’ll come back to `{children()}`.  First, let’s talk about React “props”. “Props” are a way of passing data around in React; They are properties that are supplied to React components. React components are reusable pieces of user interface (UI) that we define. To make them reusable — or, dynamic — we need to be able to supply them with different data. Let’s take a look at this using our familiar `<Header />` component.

### ✋ Generate the Header’s title text using props, instead
1. On line 17 of `/src/layouts/index.js`, add an attribute called “title” to the `<Header />` component, and assign it some arbitrary text.


    <Header
      title="Meet React Props!"
    />


2. On line 4 of `/src/components/Header/index.js`, type `props` between the parentheses.
3. On line 27 of `/src/components/Header/index.js`, change the text “Gatsby” to `{props.title}` and then save.
![](https://d2mxuefqeaa7sj.cloudfront.net/s_6A62B36EFB998D5FDEECD8DADE2FB6C1DA809B18BA696F4E3EE3B05A492D3DF8_1522726966324_gatsby-header3.gif)


When React sees that we are including a user-defined component like `<Header />`, it will pass any attributes provided to the component as a single object (“props”). 

> 💡 In JSX, you can embed any JavaScript expression by wrapping it with `{}`. This is how, in step 3, we can access the `title` property (or “prop!”) from the “props” object.)

To emphasize how this makes our components reusable, let’s add an extra `<Header />`  component to our layout.

### ✋ Reuse a React Component
1. Back over in `/src/layouts/index.js`, add a second `<Header />` under our existing one, and pass it a different title. 


    <Header 
      title="Meet React Props!"
    />
    <Header
      title="Reusing the Header!" 
    />


![](https://d2mxuefqeaa7sj.cloudfront.net/s_E618395E4841D470F48D0AACF52A3EBAEA74345E0FB4AC285CBC937727755E20_1522986592512_gatsby-component-reuse.gif)


And there we have it; A second header — without rewriting any code — by passing different data using props.

*(Note: Before moving on, to avoid confusion, let’s delete the second `<Header />` and change the `title` of the remaining* `<Header />` *component back to “Gatsby”).*

## What are React "children"?

We learned in the previous section that React automatically makes any attributes we explicitly pass to a component available on an object. But that’s not all it passes!

### ✋ Manually import the homepage component
1. Back over in `/src/layouts/index.js`, let’s import our homepage from the `/pages` directory:


    import HomePage from '../pages/index'


2. Then, change `{children()}` to `<HomePage />`.
![](https://d2mxuefqeaa7sj.cloudfront.net/s_6A62B36EFB998D5FDEECD8DADE2FB6C1DA809B18BA696F4E3EE3B05A492D3DF8_1522987849900_gatsby-homepage-direct.gif)


You should see no changes on your homepage. What’s happening here?

In Gatsby, components defined in `/src/pages` automatically become pages. (`/src/pages/index.js` becomes your homepage at (`'/'`), `/src/pages/page-2.js` is located at (`'/page-2'`), and so forth). 

Under the hood, Gatsby is passing your `/pages` components into the default layout for you. 

### ✋ Using `props.children`
1. On the line where we define `const TemplateWrapper…`, change `({ children })` to `( props )`.
2. Replace `<HomePage />` with `{props.children()}`.


![](https://d2mxuefqeaa7sj.cloudfront.net/s_6A62B36EFB998D5FDEECD8DADE2FB6C1DA809B18BA696F4E3EE3B05A492D3DF8_1522991267233_gatsby-homepage-children.gif)


As before, you should see no change in the browser when you save the file. `props.children()` essentially displays whatever is passed to the parent component. In this case, our parent component is the layout component defined at `/src/layouts/index.js`. 

It’s as if we wrote something like this:


    <DefaultLayout>
      <HomePage /> // this is a "child" of <DefaultLayout>
    </DefaultLayout>

Except we aren’t explicitly including `<HomePage />`  ourselves — Gatsby is taking care of that for us.

### 💡 `{children()}` vs `{props.children()}`

If you’re new to JavaScript, you may be wondering how these are equivalent. The answer lies in the first line of our function definition (`const TemplateWrapper…`). 


    `const TemplateWrapper = (props) => (` […]

When we use `(props)`, we are essentially assigning the name `props` to the object that React automatically passes to our component. We then reference the value of the `children` property on the `props` object — `props.children`.


    `const TemplateWrapper = ({ children }) => (` […]

When we use `({ children })`, we are essentially saying, “I know I’m receiving an object here with a property called `children`. Go ahead and give me a reference to the value of the `children` property on that object, with a variable of the same name.”

> 💡 If you’re curious, read more about [destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment).


## ➡️ What’s Next?

In this section we:

- [x] Learned about Gatsby starters, and how to use them to create new projects
- [x] Familiarized with Gatsby’s basic file structure
- [x] Learned about JSX syntax
- [x] Learned about `/pages`
- [x] Learned about `/components`
- [x] Learned about `/layouts`
- [x] Learned about React “props”, reusing React components, and `props.children`

Now, let’s move on to [adding styles to our site](/tutorial/part-two/)!

