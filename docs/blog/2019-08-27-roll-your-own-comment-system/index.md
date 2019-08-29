---
title: Roll Your Own Comment System
date: 2019-08-27
author: Tania Rascia
excerpt: "I wanted a simple, custom, ad-free solution to comments on my Gatsby blog, so I designed my own. Here's how I did it!"
tags:
  - comments
  - apis
canonicalLink: https://www.taniarascia.com/add-comments-to-static-site/
---

A while ago, I [migrated my site from WordPress to Gatsby](/blog/2019-03-21-migrating-from-wordpress-to-gatsby/), a static site generator that runs on JavaScript/React. Gatsby [recommends Disqus](/docs/adding-comments/) as a possible option for comments, and I briefly migrated all my comments over to it...until I looked at my site on a browser window without adblocker installed. I could see dozens of scripts injected into the site and even worse - truly egregious buzzfeed-esque ads embedded between all the comments. I decided it immediately had to go.

I had no comments for a bit, but I felt like I had no idea what the reception of my articles was without having any place for people to leave comments. Occasionally people will leave useful critiques or tips on tutorials that can help future visitors as well, so I wanted to try adding something very simple back in.

I looked at all the options, but I really didn't want to invest in setting up some third party code that I couldn't rely on, or something with ads. So I figured I'd set one up myself. I designed the simplest possible comment system in a day, which this blog now runs on.

Here's some pros and cons to rolling your own comment system:

#### Pros

- Free
- No ads
- No third party scripts injected into your site
- Complete control over functionality and design
- Can be as simple or complicated as you want
- Little to no spam because spambots aren't set up to spam your custom content
- Easy to migrate - it all exists in one Heroku + Postgres server

#### Cons

- More work to set up
- Less features
- Need to set up manual anti-spam measures and moderation

If you've also struggled with this and wondered if there could be an easier way, or are just intrigued to see one person's implementation, read on!

## Introduction

This guide will _not_ be a full, guided walkthrough - however, all the steps to create this are documented from start to finish in [Create and Deploy a Node.js, Express, & PostgreSQL REST API to Heroku](https://www.taniarascia.com/node-express-postgresql-heroku/). The comments API is a Node + Express server connected to a Postgres instance hosted for free on the hobby tier of Heroku (Hopefully I don't go over the 10,000 row limit any time soon). A combination of that article and what I've documented here can get you all the way to having your own comment system.

> Note: Comments overall aren't a big deal to me, so I don't care if I'm just running some little hobby API I created, or if it goes down for any reason. I think it should be pretty solid, but obviously if your needs are more professional than mine, you should go ahead and buy Disqus or something.

The comments API consists of three parts:

- [Database](#database)
- [API Server](#api)
- [Front End](#front-end)

The front end is written for React, but if you know how to make a form and an API call, it can be easily adjusted to whatever static system you're using.

## Database

The first step assumes we'll be setting up a Postgres database called `comments_api` with a `comments` table.

In the `comments_api` database, I created a `comments` table, with `ID`, `name`, `date`, and `text`. The `slug` refers to the article URL - so for `https://example.com/how-to-bake-a-cake`, the slug would be `how-to-bake-a-cake`. Finally, I added `parent_comment_id` in case you want to have the ability to reply to comments.

```sql
CREATE DATABASE comments_api;

\c comments;

CREATE TABLE comments (
  ID SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  date TIMESTAMPTZ DEFAULT Now(),
  slug VARCHAR(255) NOT NULL,
  parent_comment_id INTEGER,
  text VARCHAR(5000) NOT NULL
);

INSERT INTO
  comments (name, text, slug, parent_comment_id)
VALUES
  ('Bogus', 'Testing the comments API', 'how-to-bake-a-cake', null);
```

You could probably get more fancy with it and add website, email, upvotes and other features, but I just wanted it to be simple. I'm not adding in any login or 0Auth/user authentication either, which makes it even more simple, but comes with the drawbacks of an anonymous online system.

## API

In [Create and Deploy a Node.js, Express, & PostgreSQL REST API](https://www.taniarascia.com/node-express-postgresql-heroku/), I document how to set up an Express server and make a Postgres pool connection.

The aforementioned article goes much deeper into production level concerns of a Node.js server, such as error handling, validation, and brute force rate limiting.

In our simplified, development example setup, we'll require `express`, a Node.js server, plus `bodyParser` and `cors` to allow our app to parse and request the data, and `pg` to create a Postgres pool connection.

> This article is using default values for the Postgres connection - `user` as username, `password` as password, etc.

```js
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const { Pool } = require("pg")
const connectionString = `postgresql://user:password@localhost:5432/comments`

const pool = new Pool({ connectionString })

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

// These are the functions we will be creating
const getComments = () => {}
const getCommentsBySlug = () => {}
const createComment = () => {}
const updateComment = () => {}
const deleteComment = () => {}

app.get("/comments", getComments)
app.get("/comments/:slug", getCommentsBySlug)
app.post("/comments", createComment)
app.put("/comments/:id", updateComment)
app.delete("/comments/:id", deleteComment)

// Start server
app.listen(3002, () => {
  console.log(`Server listening`)
})
```

Remember that this example is simply for demonstration purposes and development.

### Get all comments

First, I want a `GET` query that will just return everything to Node.js, ordered by date. This is just for me to have, so I can easily review all comments.

```js
const getComments = (request, response) => {
  pool.query("SELECT * FROM comments ORDER BY date DESC", (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}
```

### Get comments by page slug

More importantly, I want a query that will only return the comments that match the current page's slug. This is the query I'll use for each article.

```js
const getCommentsBySlug = (request, response) => {
  const slug = request.params.slug

  pool.query(
    "SELECT * FROM comments WHERE slug = $1 ORDER BY date DESC",
    [slug],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    }
  )
}
```

### Create a comment

Add the ability to `POST` a new comment, which people will be able to do through the HTML form.

```js
const createComment = (request, response) => {
  const { name, slug, text } = request.body
  const parentCommentId = parseInt(request.body.parentCommentId)

  pool.query(
    "INSERT INTO comments (name, slug, text, parent_comment_id) VALUES ($1, $2, $3, $4)",
    [name, slug, text, parentCommentId],
    error => {
      if (error) {
        throw error
      }
      response
        .status(201)
        .json({ status: "success", message: "New comment added." })
    }
  )
}
```

### Update an existing comment

As moderator, I want the ability to update an existing comment. Commentors won't be able to edit their comments, because they're all anonymous. This will be a protected endpoint.

```js
const updateComment = (request, response) => {
  const { name, slug, text } = request.body
  const id = parseInt(request.params.id)
  const parentCommentId = parseInt(request.body.parentCommentId)

  pool.query(
    "UPDATE comments SET name = $1, slug = $2, text = $3, parent_comment_id = $4 WHERE id = $5",
    [name, slug, text, parentCommentId, id],
    error => {
      if (error) {
        throw error
      }
      response
        .status(200)
        .json({ status: "success", message: `Comment modified with ID: ${id}` })
    }
  )
}
```

### Delete a comment

Another protected endpoint, only I will have the ability to delete a comment.

```js
const deleteComment = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query("DELETE FROM comments WHERE id = $1", [id], error => {
    if (error) {
      throw error
    }
    response
      .status(200)
      .json({ status: "success", message: `Comment deleted with ID: ${id}` })
  })
}
```

### Putting it together

We have our two `GET`s, a `POST`, `PUT`, and `DELETE`.

```js
app.get("/comments", getComments)
app.get("/comments/:slug", getCommentsBySlug)
app.post("/comments", createComment)
app.put("/comments/:id", updateComment)
app.delete("/comments/:id", deleteComment)
```

## Front End

Again, for the front end I'm using React as an example, but the concept is the same for any template system. In whatever your post template file is, use JavaScript to make a `fetch` or `axios` call to your comment API, and save the data in state somewhere. Once I retrieve the JSON response from the API server, which will be an array of comment objects, I can pass it to wherever I'm displaying the comments.

> Sorry, I'm not using hooks yet. It's okay, deep breath. We'll get through this.

```jsx:title=templates/post.js
class PostTemplate {
  ...
  async componentDidMount() {
    const { slug } = this.props.pageContext

    try {
      const response = await fetch(`https://www.example.com/comments/${slug}`)
      const comments = await response.json()

      this.setState({ comments })
    } catch (error) {
      this.setState({ error: true })
    }
  }
```

In this case, that will be a `Comments` component.

```jsx:title=templates/post.js
render() {
  return (
    <div>
      {!error && <Comments commentsList={comments} slug={slug} />}
    </div>
  )
}
```

The `Comments` component will contain both the form to submit a comment, and the list of existing comments if there are any. So in state, I'll save the comments list, and an object to store new comment state for the form.

```jsx:title=components/comments.js
import React, { Component } from "react"
import moment from "moment"

class Comments extends Component {
  // You'll need a constructor() here if you're not using Babel transform-class-properties
  initialState = {
    comments: this.props.commentsList || [],
    newComment: {
      name: "",
      text: "",
      slug: this.props.slug,
      parentCommentId: null,
    },
    submitting: false,
    success: false,
    error: false,
  }

  state = this.initialState
}
```

I'll admit this code is not the most pristine I've ever seen, but as I mentioned, I wrote the thing in a day, so feel free to refactor and write however you want.

When a comment is submitted, I'll use `fetch` once again, this time with the `post` method. If everything went through correctly, append the new comment to the comments array, and reset the new comment.

```jsx:title=components/comments.js
onSubmitComment = async event => {
  event.preventDefault()

  // Set this so the button can't be pressed repeatedly
  this.setState({ submitting: true })

  const { newComment, comments } = this.state
  const { slug } = this.props

  try {
    // POST to /comments
    const response = await fetch("https://www.example.com/comments", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "post",
      body: JSON.stringify(newComment),
    })

    // Append comment and reset newComment
    this.setState(prevState => ({
      ...prevState,
      comments: [newComment, ...comments],
      newComment: {
        name: "",
        text: "",
        slug,
        parentCommentId: null,
      },
      success: true,
      error: false,
    }))
  } catch (error) {
    this.setState({ ...this.initialState, error: true })
  }
}
```

I'll also have an `onChange` handler for the form.

```jsx:title=components/comments.js
handleChange = event => {
  const { newComment } = this.state
  const { name, value } = event.target

  this.setState({
    newComment: { ...newComment, [name]: value },
  })
}
```

We can start the render lifecycle now.

```jsx:title=components/comments.js
render() {
  const { submitting, success, error, comments, newComment: { name, text } } = this.state
```

I made some simple error or success messages to show after submnitting the form.

```jsx:title=components/comments.js
const showError = () =>
  error && (
    <div className="error">
      <p>Comment failed to submit.</p>
    </div>
  )

const showSuccess = () =>
  success && (
    <div className="success">
      <p>Comment submitted!</p>
    </div>
  )
```

The comment form only consists of name and comment in my case, as I decided to go the [Sivers](https://sivers.org/) route and only allow comment replies by yours truly on the site.

```jsx:title=components/comments.js
const commentForm = () => (
  <form id="new-comment" onSubmit={this.onSubmitComment}>
      <label for="name">
      Name:
    <input
      type="text"
      name="name"
      id="name"
      value={name}
      onChange={this.handleChange}
      maxLength="255"
      placeholder="Name"
      required
    />
    </label>
    <label for="text">
    Comment
    <textarea
      rows="2"
      cols="5"
      name="text"
      id="text"
      value={text}
      onChange={this.handleChange}
      placeholder="Comment"
      required
    />
    </label>
    <button type="submit" disabled={!name || !text || text.length < 20 || submitting}>
      Submit
    </button>
  </form>
}
```

Finally, we'll display the form and the comments. I decided to either display the form or a success/error message. A visitor won't be able to leave two comments in a row without reloading the page.

After that, it's just a matter of looping through the comments and displaying them. I've made comment replies incredibly simple - only one reply allowed per post, and no nesting.

```jsx:title=components/comments.js
return (
  <section id="comments">
    {success || error ? showError() || showSuccess() : commentForm()}
    {comments.length > 0 &&
      comments
        .filter(comment => !comment.parent_comment_id)
        .map((comment, i) => {
          let child
          if (comment.id) {
            child = comments.find(c => comment.id == c.parent_comment_id)
          }

          return (
            <div className="comment" key={i}>
              <header>
                <h2>{comment.name}</h2>
                <div className="comment-date">
                  {moment(comment.date).fromNow()}
                </div>
              </header>
              <p>{comment.text}</p>
              {child && (
                <div className="comment reply">
                  <header>
                    <h3>{child.name}</h3>
                    <div className="comment-date">
                      {moment(child.date).fromNow()}
                    </div>
                  </header>
                  <p>{child.text}</p>
                </div>
              )}
            </div>
          )
        })}
  </section>
)
```

## Conclusion

You'll probably also want to add in some anti-spam moderation system, like adding a `moderated` column to the comments, setting it to `false` by default, and manually setting it to `true` if you approve the comment.

I hope this helps out someone who wants a simple, free system for their own personal site. I like reinventing the wheel and making things from scratch. It's fun, and I learn a lot.

For more information on building contact forms with Gatsby, check out the [docs reference guides](/docs/building-a-contact-form/).
