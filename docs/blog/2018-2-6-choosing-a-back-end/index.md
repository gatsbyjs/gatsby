---
title: Picking a back-end for GatsbyJS
date: "2018-02-06"
author: "Ross Whitehouse"
---

Hace un tiempo atrás tuve la picazón de cada seis meses de rehacer mi sitio de trabajo, y decidí que aprendería a usar Gatsby. Pero eso parece ser solo la mitad de la batalla. Luego de hayas construido tu interfaz, ¿cómo te decides con el dorsal final? ¡Hay muchísimos!

![GatsbyJS](gatsby.jpeg)

## Fondo - ¿Por qué Gatsby?

La única cpsa tan abundante como las opciones de Headless CMS son las opciones de Static Site Generator. Desde Hugo (construido en lenguaje de Google Go) hasta Jekyll (Ruby) e incluso Nuxt que está basado en VueJS. Elegí Gatsby del paquete por un número de rasones, entre las cuales la romienente es que soy un desarrollador profesional de React.js, así que usar React en estos proyectos rápidos es un gran beneficio.

Gatsby hace de un "generador muy rápido de sitios estáticos para React". Así que si puedo crear sitios, pero también abarcar conocimientos de React, pues mejor, ¿no? Y siempre estoy buscando proyectos paralelos y en sitios para otros, así que si puedo tener un JAMstack ordenado más rápido y de manera más sencillaque mi anterior montón de WordPress, ¡entonces mejor! Pensé que era mejor empezar con mi propio sitio, para testear la viabilidad.

> **¿Qué es apilar?** JAM significa Javascript, API, Markup. Hay muchos beneficios para este tipo de sitio, pero el único en el que estoy interesado es que tu CMS esté separado de tu sitio - no hay construcción fuerte de WordPress para tu pequeño sitio blog.
> [Puedes leer más en la página web de JAMstack](https://jamstack.org/).

Descubrí que Gatsby es un verdadero placer. Puedes encontrar tutoriales en su sitio para la disposición y una vez que veas el código, es bastante simple. Puedo recomendar persomalmente [La serie de Scott Tolinski - disponible en YouTube](https://www.youtube.com/watch?v=b2H7fWhQcdE&list=PLLnpHn493BHHfoINKLELxDch3uJlSapxg). Gatsby envuelve React y React Router con una buena estructura de carpeta, webkit, ES6, soporte de SASS y - más importante - GraphQL.

> **¿Qué es QL?** GraphQL es un lenguaje dudoso para APIs. Mientras que en WordPress tenía que hacer el post completo solo para colocar el título, con GraphQL puedo decirle al API que me de solo el título.
> [Su sitio es muy útil también](http://graphql.org/).

Tuve el sitio montado bastante rápido luego de aprenderlo. Hay muchos tutoriales y material instruccional por ahí. Y puedes usar tanto o tan poco de React como quieras. También hay una [lista masiva de complementos disponibles](/docs/plugins/), el cual solamente crecerá.

Así que si tienes alguna experiencia con React, o si apenas estás empezando, esta es una gran elección. Gatsby no te dice cómo se debe ver tu código. De hecho su montaje está hecho para que puedas usar archivos Markdown por páginas, pero no me encanta eso, así que no lo huzo. ¡Tan simple como eso! Igualmente, si quiero escalar esto para crear sitios web para otras personas, no quiero pasar años enseñandoles cómo usar Markdown, clona un git repo y añádelo al git repo. Cola a Headless CMS.

Haz construido tu sitio. Haz tenido tu SASS, haz tenido tus archivos Markdown (o no), ¡pero todo está en blanco! ¿Y ahora qué? ¿Cómo lo poblamos de contenido?

## El siguiente paso: un dorsal final.

Ahora necesitamos un sistema para manejar y entregar nuestro contenido en un buen API (instruido por nuestro GraphQL, por supuesto). Y ahí hay muchos de ellos. Para ayudarnos, Gatsby tiene complementos para abastecer a algunos Headless CMS como el WordPress API, Contentful, Cockpit, Prismic y NetlifyCMS - del cual Gatsby tiene una guía. Estaré yendo a través de algunos de estos para ver cuál puede ser más útil para este pequeño proyecto, y yendo hacia adelante.

> Luego de postear esto, he oído algunas cosas buenas acerca [GraphCMS](https://graphcms.com/) - Está diseñado para trabajar con GraphQL inherentemente y tienen un [Proyecto de inciador de Gtasby](https://github.com/GraphCMS/graphcms-examples/tree/master/gatsby-source-plugin-blog) ejemplo para revisar.

Primero, sin embargo, ¿por qué queremos un Headless CMS y un JAMstack para este proyecto? Hay unas pocas razones por los que las personas los usan, y algunas que se reducen a preferencia personal:

1. **¡Fácil montaje!**
2. **Sin código de el dorsal final.** Soy un desarrollador de interfaz y, honestamente, no quiero pasar horas desarrollando algunos PHP que no disfrutaré. Dame cosas buenas.
3. **No necesitas servidor.** La nube de CMSs significa que no debo pagar a las personas anfitrionas para establecer un database SQL.
4. **Fácil de editar.** Si necesito editar un sitio en el vuelo o tengo un cliente que necesita hacer lo mismo, no necesitan tocar ningún código o correr hacia su lugar de trabajo en casa para arreglarun error de gramática. Pueden acceder a ello desde cualquier lado.

---

![Contenful](contentful.png)

### Contento

Este es del que más he hablado en mi investigación. Contentful es grande y muy conocido - usado por 130 mil desarroladores si su sitio web es para ser confiado. También me gusta su descripción "Rápido. Flexible. Prueba de futuro. Es todo lo que tu CMS no." También podría decir "Mi CMS puede vencer a tu CMS."

Con todo el aclamo, de todas maneras, puede venir una fuerte etiqueta de precio. Contentful si tiene un tier gratis si colocas su logo en el pie de página, puedes quedarte con 10,000 archivos y tener 3 usuarios- lo cual no está tan mal. Para mi sitio personal estoy feliz de plasmar cualquier atribución en el pie. Si querías usar para un cliente y no les gusta tener el logo de alguien más ahí, puedes ser un tier medio con las mismas especificaciones por 39$ al mes.

![Contentful's Pricing Packages](contentful-pricing.png)

De la edición del desarrollador pagado hacia arriba, parece una fuerte tarifa, especialmente comparado a otros. Con eso dicho, si tienes un cliente dispuesto a dar 949$, ¿por qué no?

![A quick sample project](contentful-project.png)

Tan pronto como te registres (gratis) tienes acceso a un tablero con algunos contenidos tontos y links de videos tutoriales\*. Puedes ver el tablero con todos los tipos de contenidos. Yo he montado una "página" para los tipos de textos de mis páginas. Podrías hacer posts u otros tipos personalizados.

> \* En los videos, el tipo pronuncia Contentful como "content" como en satisfecho o contento. Yo siempre pensé que era Contentful con "content" como en CMS. ¿Pero qué sé yo? Él trabaja ahí.

![Contentful's well-laid-out post-types](contentful-page.png)

You then setup your fields, choosing from a big list. If you want a simple Title/Body you can set it up as above, or you can use times and dates, images, whole JSON Objects and more. You can also localise fields to only show in certain countries, make them required, and how they appear in the CMS. For example, I couldn’t see how to create a checkbox (as there isn’t a field-type for it), but if you create a Short text field you have the option to only allow certain values. Then, you can set the CMS-appearance to a drop-down or some radio buttons. I’d have liked that to be an option as soon as I add a field - something like WordPress’ custom fields - but once you know it’s there it makes sense.

![There are loads of field types available!](contentful-fields.png)

Contentful looks like a fantastic service. It isn’t perfect but it checks all my boxes — and what do you want for nothing? It’s definitely the one to beat.

---

![WP's REST API](wp.jpeg)

### WordPress’ REST API

Ever since I started coding I’ve used WordPress as a traditional CMS. I’m familiar with how it works, the terminology and documentation. I know that WordPress is very very well-documented. The API includes ACF - a plugin known to most if not all WP devs and theme builders - which opens the posts out to accept all sorts of different fields. In fact, one of my issues about Contentful was based on my much-longer-term experience with ACF and WP.

I’m sure I don’t need to spend too much time telling you the benefits of WordPress. The support is great, the interface is great, and it scales wonderfully. In fact WordPress boasts 29% of the entire internet uses their service. That’s absolutely huge. There are a million and one plugins for everything from SEO to E-commerce, Custom Post Types, Custom Fields and more.

How does this hook up to our Gatsby build, then? Well if you have WordPress.com - WP’s free blogging platform - you can do it automatically for free. If you have WordPress.org - the big-brother that allows custom development - then you’ll need to host that somewhere (possibly free, but more likely paid-for if you get much traffic). My issue with the WP API is that I wanted something that would strip me of the usual server-database setup. But that’s what I’d need to run a WordPress.org CMS - even in a decoupled capacity. I really just one a one-stop-cloud-shop for my CMS like Contentful.

The WordPress.com option is one to consider. They have a [developer blog](https://developer.wordpress.com/2016/11/11/wordpress-rest-api-on-wordpress-com/) about how to get started, which links to a really cool [API console](https://developer.wordpress.com/docs/api/console/) where you can experiment with the different types of requests you can make. In fact Gatsby makes this easier with the [`gatsby-source-wordpress` plugin](/packages/gatsby-source-wordpress). In your Gatsby configuration file you set the URL of your WP install. Then in your WordPress site, [configure a new App](http://developer.wordpress.com/apps/), and your data is ready to be pulled down using a GraphQL Query.

A lot of this information came from a [fantastic tutorial by Jeremey Duvall](https://jeremey.blog/gatsby-photo/). He goes through Gatsby, WordPress.com setup and hooking it up with GraphQL. It’s the whole setup right there.

The only problem with the WordPress.com setup is that it’s restricted to posts and pages that boil down to title/image/content. If you want ACF or other plugins you’re going to need a paid-for WP package, which harks back to the WordPress.org issue: I can’t use it without paying for it.

---

### NetlifyCMS

We’ll be hearing more about Netlify in another article - their original product is a CDN for your entire site, and I’ll be writing more about serving your Gatsby site - but right now we’ll focus on their CMS. Firstly, it’s build on React, so it’s a good bet it’ll play nice with Gatsby (not to mention the Gatsby plugin I mentioned earlier).

One big difference from the others here is that the content in NetlifyCMS is kept in your Git repo, meaning that code and content are versioned together. You won’t ever lose content if you still have the repo, and you can see the history at the press of a button - same as you can with your code.

[Gatsby has a handy tutorial for NetlifyCMS](/docs/netlify-cms/) but they do stress that in order to save to Github etc, you will need your own server:

> To save your content in a Git repo, the repo will need to be hosted on a service like GitHub, and you’ll need a way to authenticate with that service so Netlify CMS can make changes through the service’s API. For most services, including GitHub, authentication will require a server.

They also say, however, that if you use NetlifyCMS with Netlify, they conveniently handle the authenticating for you. Netlify will watch your Git repository for changes and update automatically. This is important to consider that they’re designed to be used together, so if you’re in for one it would benefit you to be in for the other. This isn’t law, but you can see why they’d make it more convenient if you lock into their ecosystem.

Pedro Duarte has a [great article](https://medium.com/netlify/jamstack-with-gatsby-netlify-and-netlify-cms-a300735e2c5d) about using Gatsby with both Netlify and NetlifyCMS.

---

### Best of the rest - Prismic.io & Cockpit

Prismic is sort of a Contentful-like service that does basically the same thing with a few differences. I’m greeted to a post-type-creator similar to Contentful’s, I can create an editor with a number of fields similar such as Title, Body, Image, Location, Link, Color.

![Prismic's CMS](prismic.png)

Prismic has a similar pricing structure to Contentful - but has a few more options at the budget-end. In fact the only difference between the 3 smaller tiers is the number of users you can add to the CMS. Further than that there are some more premium versions with up to an infinite amount of users and some fancy features like user roles and collaboration. Certainly for bigger projects and bigger clients that would be useful.

![They do have more pricing options than Contentful](prismic-pricing.png)

Cockpit also seems to share a lot of the same features except for two big differences:

* It’s open source - anyone can download it, anyone can contribute to the git repository and improve it, meaning it’s fully free and will be available - in one form or another - forever. I could see an issue with Contentful if the service ever stopped working. They have backups on AWS and create nightly backups on their premium plans, but the actual interface may become unavailable. Because Cockpit is open source they could go out of business or go offline for a night or just stop working altogether, and there’s a repo available with your CMS on.

* It’s self-hosted - this ties into the last point and if it did all come crashing down, as long as your site is still active so will your CMS be. Great news for the tech-paranoid!

---

## Conclusion - Which Back-End is right?

If nothing else, writing this article has given me a checklist that I need a CMS to fulfil. Some other CMSs have great features, but a couple of them are much more important to my use-case than others.

### Free Option

This is the top of the list. If I’m just messing about with the system, I don’t want to be forking out. If I have a larger project with a client who has actual money, then I’d reconsider. Also to this point I’d like it to be scalable. If I make a friend’s small site with Gatsby, and then overnight his company becomes million-pound business, I want to be able to upgrade the CMS to handle an increase in users or posts.

### Ease Of Use

Cloud-hosted or Git-hosted seem to be the best for this. I don’t need a server to run them and I can control it all in one place. The UI needs to be easy enough for a non-developer and it’d be nice if the system was well-supported so I could get help with issues when needed.

In terms of which CMS to go with, they all have great merits and I can see them all being useful for different projects. But for my needs - for smaller side projects and for personal sites - Contentful and Prismic seem like the ones to go for. They’re both cloud-based with minimal setup and work via an API so I can access them wherever I need to. Also their free tiers have great features, and scale easily so that if I have a ‘proper’ project, I can get a version that will suit any needs.

Was this post useful? Do you use any of these CMSs, or a different one? Please let me know, I’d love to hear about how you get one with them. And look out for a future post about hosting. I mentioned that NetlifyCMS runs great with Netlify, but there are other options! I’ll be looking at Github Pages, Heroku and more!

You can find me on [Twitter](https://twitter.com/RossWhitehouse) and [Instagram](https://www.instagram.com/ross.dw/), and [check out my other posts](https://medium.com/@RossWhitehouse)!
