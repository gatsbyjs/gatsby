---
title: How to export a Drupal site to Gatsby
date: 2018-12-18
author: Joaquín Bravo Contreras
tags: ["drupal", "getting-started"]
---

This blogpost explains how I learned to reduce the cost of maintaining a simple brochure or blog site. When using Drupal, you need at least a shared hosting platform (there is no Wordpress.com for Drupal sites). So, migrating to a static site generator, like Jekyll or Gatsby, seemed like a good idea. Gatsby is also a great opportunity to learn React and then get hosting for free using something like GitHub Pages. This post is going to describe how to migrate a simple blog--that has featured images on the posts, comments and tags--from Drupal to Gatsby.

To facilitate exporting the site, the first thing I did was export the database from the mysql database server to an sqlite file that I could use locally. To do this I used the [mysql2sqlite](https://github.com/dumblob/mysql2sqlite) project, which, as described on the project page, can be done with two commands like:

```
mysqldump --skip-extended-insert --compact DB_name > dump_mysql.sql
./mysql2sqlite dump_mysql.sql | sqlite3 mysqlite.db
```

## How to export a Drupal site to Gatsby yourself

To do this yourself, you'll build a simple blog using the excellent [gatsby-starter-blog](https://github.com/gatsbyjs/gatsby-starter-blog) project. Create a new project and then add a [sqlite library](https://github.com/JoshuaWise/better-sqlite3) as a dev dependency:

```
gatsby new gatsby-blog https://github.com/gatsbyjs/gatsby-starter-blog
git init # so you can keep track of the changes
npm i --save-dev better-sqlite3
```

The useful commands on an sqlite3 command line to explore are `.tables` to see all tables :) and `.schema table_name` to see information about a specific table. Oh! and `.help` to know more.

Next, you will be creating a new file on your project at `src/scripts/migrate.js`. Initially, what you want is to iterate through all your posts and export basic data like title, created date, body and status (published or draft). All of that data is in two tables, the _node_ table and the _field_data_body_. Initially, your script will look like this:

```javascript
const Database = require('better-sqlite3');
const fs = require('fs');
const http = require('http');

// argv[2] would be the first argument passed to > node src/scripts/import.js [database.db]
const db = new Database(process.argv[2], {readonly: true});

const rows = db.prepare(`SELECT n.nid, n.title, n.created, b.body_value, n.status FROM node n
  INNER JOIN field_data_body b ON b.entity_id = n.nid`).all();
rows.forEach(row => {
  // taken from: https://gist.github.com/matthagemann/382adfc57adbd5af078dc93feef01fe1
  const slug = slugify(row.title);
  const folder = row.status ? '/../pages/' : '/../../drafts/';
  const path = __dirname + folder + slug;
  // timestamp in Drupal is in seconds, Date() expects microseconds
  const date = new Date(row.created * 1000);
```

The interesting thing here is the initial query, and this is based on a Drupal 7 database. A Drupal 8 or Drupal 6 database could be different, so check your schema. Next, load the tags on a simple JavaScript array. Each post can have more than one tag, so you can take advantage of better-sqlite's _.pluck()_ function, which retrieves only the first column of a database query, and the _.all()_ function, which retrieves all rows in a single array:

```javascript
const tags = db
  .prepare(
    `SELECT td.name FROM taxonomy_index ti
    INNER JOIN taxonomy_term_data td ON td.tid = ti.tid AND ti.nid = ?
    WHERE ti.tid NOT IN (SELECT tid FROM taxonomy_index GROUP BY tid HAVING count(nid) = 1)`
  )
  .pluck()
  .all(row.nid)
```

For the image, you will retrieve only the URL of the image, so you can download it and store it locally. And you will replace `public://` for the URL path of the images folder on your old site:

```javascript
let image = db
  .prepare(
    `SELECT filename, uri FROM field_data_field_image i
    INNER JOIN file_managed f ON f.fid = i.field_image_fid
    WHERE i.entity_id = ?`
  )
  .get(row.nid)
if (image) {
  image.uri = image.uri.replace("public://", "http://myblog.com/files/")
}
```

And now that you have all the data you need, it is just a matter of creating a file with the metadata in yaml format and the body of the text in Markdown format. Luckily, a Drupal blog can also use Markdown or you can also look for an HTML to Markdown JavaScript library like [turndown](https://github.com/domchristie/turndown).

```javascript
  fs.mkdir(path, (err) => { });
  const file = fs.createWriteStream(path + '/index.md', { flags: 'w' });
  // This is here incase any errors occur
  file.on('open', function () {
    file.write('---\n');
    file.write('title: "' + row.title + '"\n');
    file.write('date: ' + date.toISOString() + '\n');
    file.write('aliases: ' + JSON.stringify(aliases) + '\n');
    file.write('tags: ' + JSON.stringify(tags) + '\n');
    file.write('---\n\n');
    if (image) {
      // taken from: https://stackoverflow.com/a/22907134/9055
      download(image.uri, path + '/' + image.filename);
      file.write(`![${image.filename}](./${image.filename})\n\n`);
    }
    file.write(row.body_value);
    file.end();
  });
  console.log(date, slug, JSON.stringify(aliases));
});

db.close();
```

This script is now finished and you can execute it in your shell with this command:

```
> node src/scripts/import.js mysqlite.db
```

To have comments on your site you can use a service like [Disqus](https://disqus.com/). Disqus has an import process that uses a [custom XML import format](https://help.disqus.com/developer/custom-xml-import-format) based on the WXR (WordPress eXtended RSS) schema. So the process would be the same. Create a script named `src/scripts/export_comments.js` to query the database and, in this case, write a single file containing all the comments of your old site:

```javascript
const Database = require("better-sqlite3")
const fs = require("fs")
const yourSite = "http://username.github.io/yoursite/"

if (process.argv.length < 3) {
  usage()
  process.exit()
}

const db = new Database(process.argv[2], { readonly: true })

const rows = db
  .prepare(
    `SELECT n.nid, n.title, n.created, b.body_value, n.status,
  c.cid, c.pid, c.name, c.mail, c.created created_comment, c.homepage, c.hostname, c.subject, cb.comment_body_value
  FROM node n
  INNER JOIN field_data_body b ON b.entity_id = n.nid
  INNER JOIN comment c ON c.nid = n.nid AND c.status = 1
  INNER JOIN field_data_comment_body cb ON cb.entity_id = c.cid
  ORDER BY n.nid, c.cid`
  )
  .all()

console.log(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dsq="http://www.disqus.com/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:wp="http://wordpress.org/export/1.0/"
>
  <channel>`)
let previous_slug = ""
rows.forEach(row => {
  const slug = slugify(row.title)
  const date = new Date(row.created * 1000)
  const date_comment = new Date(row.created_comment * 1000)
  if (slug != previous_slug) {
    if (previous_slug != "") {
      console.log(`</item>`)
    }
    console.log(`<item>
      <title>${row.title}</title>
      <link>${yourSite}${slug}</link>
      <content:encoded><![CDATA[${row.body_value}]]></content:encoded>
      <dsq:thread_identifier>${row.nid}</dsq:thread_identifier>
      <wp:post_date_gmt>${getDisqusDate(date)}</wp:post_date_gmt>
      <wp:comment_status>open</wp:comment_status>`)
    previous_slug = slug
  }

  console.log(`
    <wp:comment>
      <wp:comment_id>${row.cid}</wp:comment_id>
      <wp:comment_author>${row.name}</wp:comment_author>
      <wp:comment_author_email>${row.mail}</wp:comment_author_email>
      <wp:comment_author_url>${row.homepage}</wp:comment_author_url>
      <wp:comment_author_IP>${row.hostname}</wp:comment_author_IP>
      <wp:comment_date_gmt>${getDisqusDate(date_comment)}</wp:comment_date_gmt>
      <wp:comment_content><![CDATA[${
        row.comment_body_value
      }]]></wp:comment_content>
      <wp:comment_approved>1</wp:comment_approved>
      <wp:comment_parent>${row.pid}</wp:comment_parent>
    </wp:comment>
  `)
})
console.log(`</item></channel></rss>`)

db.close()

function usage() {
  const path = require("path")
  const scriptName = path.basename(__filename)
  console.log("node " + scriptName + " <database.sqlite>")
}

function getDisqusDate(date) {
  return (
    date.toISOString().slice(0, 10) + " " + date.toISOString().slice(11, 19)
  )
}

function slugify(string) {
  const a = "àáäâãåèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;"
  const b = "aaaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------"
  const p = new RegExp(a.split("").join("|"), "g")

  return string
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, "-and-") // Replace & with ‘and’
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters
    .replace(/\-\-+/g, "-") // Replace multiple — with single -
    .replace(/^-+/, "") // Trim — from start of text .replace(/-+$/, '') // Trim — from end of text
}
```

Run `node src/scripts/export_comments.js ../mysqlite.db > comments.xml` and that's it. This will generate a **comments.xml** file that you can [import into disqus](https://import.disqus.com/). Just remember to change the **yourSite** variable in the script, and it will link each comment to the correct post in your new blog using the slug used in the posts import.

You now have all the posts and all comments ready to be used on your Gatsby blog. You can see a working example here: https://github.com/jackbravo/joaquin.axai.mx.
