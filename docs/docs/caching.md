---
title: "Caching Static Sites"
---

An important part of creating a very fast website is setting up proper HTTP caching. HTTP caching allows browsers to cache resources from a website so that when the user returns to a site, very few parts of the website have to be downloaded.

Different types of resources are cached differently. Let's examine how the different types of files built to `public/` should be cached.

## HTML

HTML files should never be cached. When you rebuild your Gatsby site, you often update the contents of HTML files. Because of this, browsers should be instructed to check on every request if they need to download a newer version of the HTML file.

The `cache-control` header should be `cache-control: public, max-age=0, must-revalidate`

## Static files

All files in `public/static/` should be cached forever. For files in this directory, Gatsby creates paths that are directly tied to the content of the file. Meaning that if the file content changes, then the file path changes also. These paths look weird e.g. `reactnext-gatsby-performance.001-a3e9d70183ff294e097c4319d0f8cff6-0b1ba.png` but since we know that we'll always get the same file when we request that path, we can cache it forever.

The `cache-control` header should be `cache-control: public,max-age=31536000,immutable`

## JavaScript

Other files e.g. JavaScript files should also be cached forever. This is because webpack 4 now also generates hashes for all files based on the content of the files, similar to what webpack 1 used to do with static files (see above).

The `cache-control` header should be `cache-control: public, max-age=31536000,immutable`

How you calibrate your caching depends on how you're hosting your site. We encourage people to create Gatsby plugins which automate the creation of caching headers for Gatsby sites. The following plugins have been created:

- [gatsby-plugin-netlify](/packages/gatsby-plugin-netlify/)
