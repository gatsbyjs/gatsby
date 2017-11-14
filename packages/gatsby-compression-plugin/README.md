# Gatsby plugin compression

First install `gatsby-plugin-compression`.

```bash

npm install gatsby-plugin-compression --save

```

Then add `gatsby-plugin-compression` to your app's `gatsby-config.js`.

```javascript

module.exports = {
  plugins: [
    `gatsby-plugin-compression`,
  ],
}

```

That's it, when you build your app you will have gzipped versions of your files.

# Nginx

If your using nginx you can use `gzip_static on;` to serve your gzipped assets, here's a full example.

```bash

#user  nobody;
worker_processes  1;

events {
    worker_connections  1024;
}

pid /usr/local/nginx/logs/nginx.pid;

server {
    listen       80;
    server_name  localhost;

    #access_log  logs/host.access.log  main;

    location / {
        gzip_static on;
        root   Users/nah/Desktop/web;
        index  index.html index.htm;
    }
}

```
