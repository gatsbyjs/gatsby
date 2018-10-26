---
title: How to export a Drupal site to Gatsby
date: 2018-10-26
author: Joaquín Bravo Contreras
tags: ["drupal", "tutorials"]
---

The motivation for this blog post was the need to reduce the cost of maintaining a simple brochure or blog site. When using Drupal you need at least a shared hosting (there is no wordpress.com for drupal sites). So migrating to a static site generator like jekyll seemed like a good idea. Gatsby can do this too, and it is also a great opportunity to learn react and then get hosting for free using something like github pages. So this post is going to describe how to migrate a simple blog that has featured images on the posts, comments and tags.

To facilitate exporting the site, the first thing I did was exporting the database from the mysql database server to an sqlite file that I could use locally. To do this I used the [mysql2sqlite](https://github.com/dumblob/mysql2sqlite) project, which, as described on the project page, can be done with two commands like:

```
mysqldump --skip-extended-insert --compact DB_name > dump_mysql.sql
./mysql2sqlite dump_mysql.sql | sqlite3 mysqlite.db
```

Our site is a simple blog so we can use the excellent [gatsby-starter-blog](https://github.com/gatsbyjs/gatsby-starter-blog) project, so we will create our project and then add a [sqlite library](https://github.com/JoshuaWise/better-sqlite3) as a dev dependency:

```
gatsby new gatsby-blog https://github.com/gatsbyjs/gatsby-starter-blog
git init # so we can keep track of our changes
npm i --save-dev better-sqlite3
```

Now, it is a matter of knowing your database. The useful commands on an sqlite3 command line to explore it are `.tables` to see all tables (duh) and `.schema table_name` to see information about a specific table. Oh! and `.help` to know more.

So, we will be creating a new file on our project at `src/scripts/migrate.js`, and initially what we want is to iterate through all our posts and export basic data like title, created date, body and status (published or draft). All of that data is in two tables, the _node_ table and the _field_data_body_. So initially our script will look like this:

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
  // timestamp in drupal is in seconds, Date() expects microseconds
  const date = new Date(row.created * 1000);
```

The interesting thing here is the initial query, and this is based on a Drupal 7 database, a Drupal 8 or Drupal 6 database could be different, so check your schema. Next, lets see how we can get the tags on a simple Javascript array. So, each post can have more than one tag, so we can take advantage of better-sqlite _.pluck()_ function, that retrieves only the first column of a database query, and the _.all()_ function, that retrieves all rows in a single array:

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

For the image, we will retrieve only the URL of the image, so we can download it and store it locally. And we will replace `public://` for the URL path of the images folder on our old site:

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

And now we have all the data we wanted, so it is just a matter of creating a file with the frontmatter data and the body of the text. Luckily our Drupal blog is also using markdown. Else we would have to look for an HTML to Markdown Javascript library.

```javascript
  fs.mkdir(path, (err) => { });
  const file = fs.createWriteStream(path + '/index.md', { flags: 'w' });
  // This is here incase any errors occur
  file.on('open', function () {
    file.write('---\n');
    file.write('title: "' + row.title + '"\n');
    file.write('date: "' + date.toISOString() + '"\n');
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

We now can import all our blog posts to markdown files with [frontmatter](https://jekyllrb.com/docs/front-matter/) metadata by running this command:

```
> node src/scripts/import.js mysqlite.db
```

To export the comments we can use a service like disqus on our static site. Disqus has an import process that uses a [custom XML import format](https://help.disqus.com/developer/custom-xml-import-format) based on the WXR (WordPress eXtended RSS) schema. So the process would be the same. Create a script named `src/scripts/export_comments.js` to query the database and, in this case, write a single file containing all the comments of our old site:

```javascript
const Database = require("better-sqlite3")
const fs = require("fs")

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
      <link>http://joaquin.axai.mx/${slug}</link>
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

Run `node src/scripts/export_comments.js ../mysqlite.db > comments.xml` and that's it. You now have all your posts and all your comments ready to be used on your gatsby starter blog.
