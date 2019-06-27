# disable-canonical-redirect

This repo shows how to disable canonical redirect that is happening whenever the URL Gatsby expects (from build time) doesn't match the URL where the page is served.

This is useful when you want gatsby to create a subset of pages for your website that you can simply prefix with a prefix-path or an asset-prefix. And your website is served behind Nginx or another similar proxy

Example of desired behavior

| Served URL            | Gatsby URL | Another server's URL |
| --------------------- | ---------- | -------------------- |
| /page-1               | /en/1/     |                      |
| /pagina-1             | /es/1/     |                      |
| /page-1/subpage-1     | /en/1/1/   |                      |
| /pagina-1/subpagina-1 | /es/1/1/   |                      |
| /old-page             |            | /old-page            |

This is a pseudo-nginx-config that would show

    server example.com

    location ~ /page-([0-9]+)$ {
            rewrite ^/page-([0-9]+)$ https://cdn.example.com/en/$1/ break;
    }

    location ~ /pagina-([0-9]+)$ {
        rewrite ^/pagina-([0-9]+)$ https://cdn.example.com/es/$1 break;
    }

    location ~ /page-([0-9]+)/subpage-([0-9+])$ {
        rewrite ^/page-([0-9]+)/subpage-([0-9+])$ https://cdn.example.com/en/$1/$2/ break;
    }

    location ~ /pagina-([0-9]+/subpagina-([0-9+]))$ {
        rewrite ^/pagina-([0-9]+)/subpagina-([0-9+])$ https://cdn.example.com/es/$1/$2/ break;
    }

    location / {
        rewrite https://old.exapmle.com break;
    }
