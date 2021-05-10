<p align="center">
  <a href="https://www.gatsbyjs.com">
    <img alt="Gatsby logomark" src="https://www.gatsbyjs.com/Gatsby-Monogram.svg" width="60" />
  </a>
</p>
<h1 align="center">
  Using MDX Example
</h1>

This repository demonstrates how to add MDX pages to a new Gatsby site.

---

In this section you will see two examples of using MDX, one of which is from a 3rd party react library and another that shows how to use existing components with MDX.

## 📊 React Charts

In the pages directory of this example you will find the `chart-info.mdx` file which uses some components to display this array of information in multiple graphs.

```javascript
export const data = [
  {
    label: "In App Purchase Income",
    datums: [
      { x: "2020", y: 9 },
      { x: "2019", y: 32 },
      { x: "2018", y: 35 },
      { x: "2017", y: 36 },
      { x: "2016", y: 38 },
      { x: "2015", y: 30 },
      { x: "2014", y: 29 },
    ],
  },
  {
    label: "Advertising Income",
    datums: [
      { x: "2020", y: 4 },
      { x: "2019", y: 3 },
      { x: "2018", y: 12 },
      { x: "2017", y: 14 },
      { x: "2016", y: 10 },
      { x: "2015", y: 9 },
      { x: "2014", y: 17 },
    ],
  },
]
```

## 🔧 Running locally

The site can be run locally on your own computer as well by following these steps:

1.  Clone the `gatsby` repository

```shell
git clone git@github.com:gatsbyjs/gatsby.git
```

2.  Navigate to the example

```shell
cd gatsby/examples/using-MDX
```

3.  Install the dependencies for the application by running

```shell

npm install

```

4.  Run the Gatsby development server

```shell
gatsby develop
```

The site is now running at `http://localhost:8000`, you can see the MDX example page at `http://localhost:8000/chart-info`

## 🧰 Resources used to create this project

- [Gatsby default starter repo](https://github.com/gatsbyjs/gatsby-starter-default)
- [Gatsby plugin MDX](https://www.gatsbyjs.com/plugins/gatsby-plugin-mdx/)
- [Bar chart from react-charts](https://react-charts.js.org/examples/bar)

## 🎓 More Guides for Learning Gatsby and MDX

Looking for more guidance? Full documentation for Gatsby lives [on the website](https://www.gatsbyjs.com/). Here are some places to start:

- **For most developers, it's recommended to start with the [in-depth tutorial for creating a site with Gatsby](https://www.gatsbyjs.com/tutorial/).** It starts with zero assumptions about your level of ability and walks through every step of the process.

- **To dive straight into code samples, head [to the official Gatsby documentation](https://www.gatsbyjs.com/docs/).** In particular, check out the [MDX section of the sidebar](https://www.gatsbyjs.com/docs/mdx/).
