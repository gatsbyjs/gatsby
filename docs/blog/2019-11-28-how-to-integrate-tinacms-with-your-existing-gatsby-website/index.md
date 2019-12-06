---
title: Integrate TinaCMS With Your Gatsby Website
date: 2019-11-28
author: Scott Byrne
tags: ["cms"]
---

TinaCMS is a git-backed toolkit for building a content editor with javascript components. Changes made with the editor are immediately written back to their source files, and are pushed to your repo when the save button is pressed.

Let’s step through how you add TinaCMS to an existing Gatsby website, using [Gatsby's Starter Blog](https://github.com/gatsbyjs/gatsby-starter-blog) as an example.

## Prerequisites

- A Gatsby project that sources `markdown` content locally, you can use [Gatsby's Starter Blog](https://github.com/gatsbyjs/gatsby-starter-blog) if you don't have an existing website.
- [Gatsby Development Environment](https://www.gatsbyjs.org/tutorial/part-zero/)

## Setup

First you need to get the site set up locally. You can reference the [Gatsby Starter Blog readme](https://github.com/gatsbyjs/gatsby-starter-blog/#readme) for additional guidance.

```
gatsby new tina-tutorial https://github.com/gatsbyjs/gatsby-starter-blog
cd tina-tutorial
```

## Install and Configure Tina

You need to install a few packages. You're going to work with markdown content in git, so you'll need `gatsby-tinacms-remark` and `gatsby-tinacms-git` in addition to the base `gatsby-plugin-tinacms` package _(styled-components is a peer dependancy of Tina, so you'll need to install it if it's not already in your project)_:

```
yarn add gatsby-plugin-tinacms gatsby-tinacms-remark gatsby-tinacms-git styled-components
```

Add `gatsby-plugin-tinacms` to your list of plugins in `gatsby-config.js`. This is also where you configure what plugins TinaCMS will use; you'll be using `gatsby-tinacms-remark` and `gatsby-tinacms-git` for this tutorial:

```
module.exports = {
  // ...
  plugins: [
    {
      resolve: 'gatsby-plugin-tinacms',
      options: {
        plugins: [
          "gatsby-tinacms-git",
          "gatsby-tinacms-remark",
        ],
      },
    },
    // ...
  ],
}
```

Now you're all set to start working with content in the Tina sidebar. If you want to test it out, run `gatsby develop` and take a look at your local site. You should see an empty Tina sidebar, like so:

**! IMAGE OF EMPTY SIDEBAR HERE !**

## Add a Form

You can add a form to the sidebar from any component. When that component is displayed on your site, the form will be displayed in the sidebar. To add a form for the blog post, you need to make three changes to `templates/blog-post.js`:

1. Add `remarkForm` to your imports.

   ```
   import { remarkForm } from "gatsby-tinacms-remark"
   ```

2. Wrap your default export with the `remarkForm` component.

   ```
   export default remarkForm(BlogPostTemplate)
   ```

3. Add `...TinaRemark` to your GraphQL query inside the `markdownRemark` node. This is a GraphQL fragment that adds additional fields used by `gatsby-tinacms-remark`.

   ```
   export const pageQuery = graphql`
     query BlogPostBySlug($slug: String!) {
       site {
         siteMetadata {
           title
         }
       }
       markdownRemark(fields: { slug: { eq: $slug } }) {
         id
         excerpt(pruneLength: 160)
         html
         frontmatter {
           title
           date(formatString: "MMMM DD, YYYY")
           description
         }

         ...TinaRemark
       }
     }
   `
   ```

Now you can spin up Gatsby with `gatsby develop` and see what this looks like on the website.

**! IMAGE OF POST PAGE WITH FORM HERE !**

You have access to all the fields being brought in with GraphQL. Without a form definition, Tina will display everything with default labels.

The `remarkForm` function is a higher-order component that modifies the data as it's passed to your component. In production, your unaltered component is rendered as normal.

## Add Form Definition

Form definitions give you control over what will be displayed in the sidebar.

1. Define your form. Here's a simple form that exposes the `Title` and `Description`:

   ```
   const BlogPostForm = {
     fields: [
       {
         label: 'Title',
         name: 'frontmatter.title',
         description: 'Enter the title of the post here',
         component: 'text',
       },
       {
         label: 'Description',
         name: 'frontmatter.description',
         description: 'Enter the post description',
         component: 'textarea',
       },
     ],
   }
   ```

2. Provide `remarkForm` with your form definition:

   ```
   export default remarkForm(BlogPostTemplate, BlogPostForm)
   ```

Now instead of the default form, we'll see our `BlogPostForm` when we open up the sidebar.

**! IMAGE OF POST PAGE WITH CUSTOM FORM HERE !**

## Add In-Page Editing

While the sidebar works well for many types of content, some content is easier to edit directly on the page. This is possible using `liveRemarkForm`, `TinaField` and the `Wysiwyg` field. Let's break this down in to steps.

1. Replace the `remarkForm` import with `liveRemarkForm` and add three more imports:

   ```
   import { liveRemarkForm } from 'gatsby-tinacms-remark'
   import { Wysiwyg } from '@tinacms/fields'
   import { TinaField } from '@tinacms'
   import { Button as TinaButton } from '@tinacms/styles'
   ```

2. Replace `remarkForm` with the `liveRemarkForm` component where you're exporting your page component:

   ```
   export default liveRemarkForm(BlogPostTemplate, BlogPostForm)
   ```

3. Modify your template to make use of `TinaField`:

   ```
   <TinaField name="rawMarkdownBody" Component={Wysiwyg}>
     <div
       dangerouslySetInnerHTML={{
         __html: props.data.markdownRemark.html,
       }}
     />
   </TinaField>
   ```

4. Provide a trigger to initiate edit mode.

   ```
   const { isEditing, setIsEditing } = props

   <TinaButton primary onClick={() => setIsEditing(p => !p)}>{isEditing ? 'Preview' : 'Edit'}</TinaButton>
   ```

The `liveRemarkForm` function is another higher-order component, similar to `remarkForm`. Instead of returning the component with modified data, it wraps the component in a `TinaForm` component to allow for on-page editing.

> `liveRemarkForm` still accepts a form definition, so the sidebar form will remain the same.

With the entire component rendering as a form, you can wrap any child in a `TinaField` component to allow for editing. The `Component` prop is used to tell Tina which field component to render the data with while editing. When you're not editing _(and in production)_ `TinaField` will pass its children.

To trigger edit mode, `liveRemarkForm` provides `isEditing` and `setIsEditing` as props to your component. To match the TinaCMS UI you can import the same `Button` component that's used in the sidebar. In the added imports above you can see it's imported as `TinaButton` for clarity.

**! IMAGE OF POST PAGE WITH INLINE EDITING HERE !**

## Add Create Post Button

So now you have a nice little editor set up for your blog, but you'll want to add a way to create new posts. You can use `RemarkCreatorPlugin` to create a content button plugin, and `withPlugin` to attach that plugin to a component. The button will show up in the top right corner of the sidebar on any page where your component is rendered.

> If you add this in `src/components/layout.js`, it will be rendered on every page.

1. Import `withPlugin` and `RemarkCreatorPlugin`.

   ```
   import { withPlugin } from 'react-tinacms'
   import { RemarkCreatorPlugin } from 'gatsby-tinacms-remark'
   ```

2. Define your plugin.

   - Provide a label for the button
   - Provide a filename. _You can reference data submitted by the form._
   - Define the fields. _These are presented as a form in a modal._

   ```
   const CreatePostPlugin = new RemarkCreatorPlugin({
     label: 'New Blog Post',
     filename: form => {
       return form.filename
     },
     fields: [
       {
         name: 'filename',
         component: 'text',
         label: 'Filename',
         placeholder: 'content/blog/hello-world/index.md',
         description: 'The full path to the new markdown file, relative to the repository root.',
       },
     ],
   })
   ```

3. Wrap your export with `withPlugin()` and provide the plugin as the second argument.

   ```
   export default withPlugin(BlogIndex, CreatePostPlugin)
   ```

You now have a way to add new posts from the Tina sidebar.

**! IMAGE OF SIDEBAR ADD BUTTON HERE !**

## Tina Teams

Now that you've built a tailored editing experience for creating and writing content, you likely want to provide this to editors that don't have a development environment.

**! SAY MORE STUFF ABOUT TEAMS HERE !**

## Summary

That's how you get up and running with Tina, but the possibilities don't end there. Check out [Tina Starter Grande](https://github.com/tinacms/tina-starter-grande) to see a more fully realized implementation of Tina on a Gatsby website.

Hopefully you've found this introduction to TinaCMS useful. Check out the [TinaCMS Repo](https://github.com/tinacms/tinacms) or jump in our community slack.
