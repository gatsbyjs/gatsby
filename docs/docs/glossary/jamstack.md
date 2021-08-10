---
title: What Is The JAMStack?
disableTableOfContents: true
---

Learn how to use Gatsby to build websites powered by the JAMStack, a modern architecture that uses JavaScript, APIs and markup without requiring the use of a database or server-side programming language.

## Overview Of The JamStack Architecture?

JAMStack is a modern architecture for building websites and applications. The _JAM_ in JAMStack stands for [JavaScript](/docs/glossary#javascript), [APIs](/docs/glossary#api), and HTML markup. Unlike websites built using WordPress or Drupal, JAMStack sites do not require a database. You can even skip the webserver, and opt to host your site using an object storage service and a content delivery network (or CDN).

With more traditional websites, such as those built using WordPress or Drupal, content is stored in a database. There's also a presentation layer of template files that mix HTML markup with template tags. Template tags are placeholders for pieces of content, e.g. `{{ title }}` for the title of the page.

A software layer then pulls it all together: it retrieves content from the database, replaces template tags with the appropriate chunks of content, and returns it all to the browser. A single page gets regenerated each time the server receives a request for that URL.

In this type of architecture, the [frontend](/docs/glossary#frontend) (what you see in the browser) and [backend](/docs/glossary#backend) (the database and software layer) are _tightly coupled_. Both the content and how it's presented are part of the same code base — sometimes called a _monolithic architecture_. Content is only available as HTML and can only be consumed by clients (e.g. web browsers) that can parse HTML.

In a JAMStack architecture, however, the frontend and backend are [decoupled](/docs/glossary#decoupled). A JAMStack frontend consists of JavaScript, HTML, and CSS. Gatsby generates these files during the [build](/docs/glossary#build) process.

A JAMStack backend is a content API that returns JSON or XML. This API can be a [hosted datastore](/docs/how-to/sourcing-data/sourcing-from-hosted-services/), a [headless CMS](/docs/how-to/sourcing-data/headless-cms/), or a custom application. It's only concerned with serving JSON or XML, which means you can use the same API for your Gatsby site and native applications.

## Advantages of a JAMStack architecture

JAMStack sites, such as those created with Gatsby, offer four key advantages over other website architectures.

- **Speed**: JAMStack sites lack the overhead caused by software and database layers. As a result, they render and load more quickly than sites that use monolithic architectures.
- **Hosting flexibility**: Because they're static files, JAMStack sites can be hosted anywhere. You can use traditional web server software, such as Apache or Nginx. For the best performance and security, you can use an object storage service and content delivery network such as [Netlify](/docs/how-to/previews-deploys-hosting/deploying-to-netlify), [Render](/docs/deploying-to-render), or Amazon Web Services' [S3 and CloudFront](/docs/how-to/previews-deploys-hosting/deploying-to-s3-cloudfront).
- **An improved developer experience**: Frontend developers can build sites without needing to know a server-side language. Backend developers can focus on building APIs. Decoupled development teams can work in parallel, allowing each team to focus on what they do best. Using a third-party [CMS](/docs/glossary#cms) service also means that your developer-operations team doesn't have to manage a separate stack for content.
- **Better security**: No database and no software layer means that JAMStack sites are not vulnerable to [SQL injection](https://www.owasp.org/index.php/SQL_Injection) or server-side [code injection](https://www.owasp.org/index.php/Code_Injection) attacks. Pages are compiled in advance, so they aren't at risk of a [server-side includes injection](<https://www.owasp.org/index.php/Server-Side_Includes_(SSI)_Injection>) attack. Hosting your site on a content delivery network offers protection from [denial of service](https://www.owasp.org/index.php/Denial_of_Service) attacks. Shifting to a JAMStack architecture limits or eliminates entire classes of vulnerabilities.

> **NOTE:** Gatsby and other JAMStack sites can still be affected by [cross-site scripting](https://www.owasp.org/index.php/Types_of_Cross-Site_Scripting) attacks. They can also be compromised if your API endpoints are compromised.

Using Gatsby can help you build faster, more secure websites, with search engine optimization and accessibility features already built in. See how Gatsby [compares](/) to other frameworks.

## Learn more about JAMStack architecture

- [JAMStack.org](https://jamstack.org/) website
- [JAMstack WTF](https://jamstack.wtf/), built with Gatsby
- [Deploying and Hosting](/docs/deploying-and-hosting/) from the Gatsby Docs
