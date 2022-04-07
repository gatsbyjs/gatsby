### How-to build and deploy to Netlify

### Packages used here:

- Node 13.7.0
- NPM 6.13.6
- gatsby-cli 2.11.1

In this document, we will host a website built with **Gatsby** on **Netlify**.

_Note: **We will start from Scratch (If you already have an Gatsby site set up, skip to Connecting to Netlify section)...**_

### Install Gatsby

Open your **terminal**, _we assume you should have **Node.JS** installed!_

```
npm install -g gatsby-cli
```

The `-g` flag in the command provided _above_ is used to **install Gatsby globally on your system, to make sure Gatsby to the dependencies.**

Go to where you want to **set up your project**, then run the command below. Whatever you decide to name your project, be sure not to call it `gatsby` (which is why we are calling this project `gatsbynetlify` as an example).

`gatsby new gatsbynetlify`

This command builds a new **Gatsby** site with the `Starter Blog`. Now you can see a `gatsbynetlify` directory, with all the assets you need to develop your site. Navigate into this new directory:

`cd ./gatsbynetlify`

Then:

`npm install gatsby-cli --save`

This command inserts Gatsby into the dependencies of your `package.json` file, which tells **Netlify** what toolchain it needs to build your site. If you named your project gatsby, npm refuses to add gatsby as a dependency of itself. Open the `/src/pages` **directory**. Inside that directory, you should see several JavaScript files, which are the pages of your website and they are also React components.

Example for `index.js`:

```js
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
```

_By default, there should be two imports at the top and a single function._

Now, display your **content**:

`gatsby develop`

Link for local server: http://localhost:8000/

### Prepping for Build

As we know, **Netlify** can use any number of versions of tools to build your site. On the other hand, **Gatsby** uses `Node.JS` and `NPM`, you need to know what version do you use, and tell **Netlify to use the same version as Gatsby.**

Enter the following command:

`node -v`

Add some `Node` version to Netlify, [learn more](https://docs.netlify.com/configure-builds/overview/#set-node-ruby-or-python-version)

### Creating the GitHub Repo

[Create a new repo](https://github.com/new) on GitHub. To avoid errors don't make `README`, `license`, or `.gitignore`. You are able to add these files after pushing your project to GitHub!

Open a terminal and navigate to the working directory of your local project and enter the following commands:

```
cd ~/PATH/TO/gatsbynetlify/
git init
git add .
git commit -m 'First commit'
git remote add origin https://github.com/<your-repository-url>
git remote -v
git push -u origin master
```

_Be sure to replace `<your-repository-url>` with the repo URL on GitHub!_

### Connecting to Netlify

### Step 1: Add Your New Site

Login to **Netlify**, click on `New site from Git` button.

![image](https://user-images.githubusercontent.com/68811721/162165732-ab7169df-f7d4-4603-be69-ca4512f8a7ff.png)

### Step 2: Link to Your Repository

Now, choose your service from the list.

Tip:

**When you push to GitHub, Gitlab, or Bitbucket, Netlify does all the work for you, meaning no more manual deploying of updates or changes!
**

![image](https://user-images.githubusercontent.com/68811721/162166036-3c1645c0-57b3-4664-b519-de40317ec282.png)

### Step 3: Authorize Netlify

Click the **`Authorize Application`** button to allow Netlify and GitHub to talk to each other.

![image](https://user-images.githubusercontent.com/68811721/162166154-637d3dbb-df7a-435e-99cb-4c8b0b133996.png)

### Step 4: Choose Your Repo

Now that you've connected Netlify and GitHub, you see a list of your Git repositories. Select the one you created earlier for your **Gatsby project**.

![image](https://user-images.githubusercontent.com/68811721/162166298-df45f862-d11e-433e-9aa3-48044312fc61.png)

### Step 5: Configure Your Settings

Here, you can configure your options (_settings_), in this tutorial, the default options are **OK**.

![image](https://user-images.githubusercontent.com/68811721/162166515-90d9e5e6-9b13-4cc9-9d9c-92f0d9eb99c4.png)

### Step 6: Build Your Site

Now, sit back, relax, and take your cup of coffee ☕. In this part, all the work is made by **Netlify Automation**.

### Step 7: Make changes

Every change you do to your project is reflected locally, as you push it and commit to **GitHub**, **Netlify** will update the website and keep it _up-to-date_.

### Step 8: Done 🎉

Wait, you thought there was going to be more? Nope! Netlify has done it all for you, including giving your site a temporary name. Now you can add your custom domain, and your site is live for your adoring public to view. Congratulations 🎉, and thanks for using Netlify!

