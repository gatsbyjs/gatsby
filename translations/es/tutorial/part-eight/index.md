---
title: Preparar el sitio web para montarlo en línea.
typora-copy-images-to: ./
disableTableOfContents: true
---

Wow! ¡Haz recorrido un largo camino! Haz aprendido a:

- crear nuevos sitios web con Gatsby
- crear páginas y componentes
- estilizar componentes
- agregar plugins a un sitio web
- agregar y transformar datos
- usar GraphQL para hacer consultas de datos para tus páginas web
- crear páginas web programáticamente utilizando tus datos

En esta sección final, te guiaremos en algunos pasos básicos para preparar y publicar tu página web, utilizando una potente herramienta de diagnóstico web llamada [Lighthouse](https://developers.google.com/web/tools/lighthouse/). A lo largo del camino introduciremos algunos plugins que comúnmente utilizarás en tus sitios web Gatsby.

## Auditoría con Lighthouse

Citando del [sitio web Lighthouse](https://developers.google.com/web/tools/lighthouse/):

> Lighthouse es una herramienta automatizada de código abierto para aumentar la calidad de las páginas web. Puedes ejecutarla para que diagnostique cualquier pagina web, publica o que requiera autenticación. Audita el desempeño, accesibilidad, aplicación web progresiva (PWAs siglas en ingles), y más.

Lighthouse viene incluido en Chrome DevTools. Ejecutando sus auditorías -- y después abordando los errores que encuentra e implementando las mejoras que sugiere -- es una manera estupenda de preparar tu sitio web para ponerlo en línea. Su ayuda te da la confianza de que tu sitio web es lo mas rápido y accesible posible.

¡Probémoslo!

Primero, necesitas generar un compilado para producción de tu sitio web Gatsby. El servidor de desarrollo de Gatsby está optimizado para hacer el desarrollo rápido; pero el sitio web que genera, aunque se acerca a una versión de producción, no está igual de optimizado.

### ✋ Genera un compilado para producción

1.  Detén el servidor de desarrollo (si es que sigue en ejecución) y ejecuta el siguiente comando:

```shell
gatsby build
```

> 💡 Como aprendiste en la [parte 1](/tutorial/part-one/), esto genera un compilado para producción de tu sitio web y crea los archivos estáticos en el directorio `public`.

2.  Observa el sitio web de producción localmente. Ejecuta:

```shell
gatsby serve
```

Una vez iniciado, puedes observar tu sitio web en [`localhost:9000`](http://localhost:9000).

### Ejecuta una auditoría Lighthouse

Ahora ejecutarás tus primeras pruebas con Lighthouse.

1.  Si aun no lo haz hecho, abre tu sitio web en Chrome en modo incógnito, para que las extensiones no interfieran con las pruebas. Después, abre la Chrome DevTools.

2.  Haz clic en la pestaña "Audits" donde mirarás una pantalla como esta:

![Lighthouse audit start](./lighthouse-audit.png)

3.  Da clic en "Perform an audit..." (todos los tipos de auditoría disponibles deberán estar seleccionadas por defecto). Después da clic en "Run audit" (tomará un minuto aproximadamente para hacer la auditoría). Una vez que la auditoría termine, verás unos resultados como estos:

![Lighthouse audit results](./lighthouse-audit-results.png)

Como puedes observar, el desempeño de Gatsby es excelente sin configuraciones previas, pero aún falta hacer algunas configuraciones para que el sitio web sea una PWA como accesibilidad, mejores practicas y SEO que mejorarán tus calificaciones (en el proceso haz tu sitio web mucho más amigable para los visitantes y motores de búsqueda).

## Agrega el archivo manifiesto

Parece que tenemos un resultado muy deslucido en la categoría "Aplicación Web Progresiva". Enfoquémonos en eso:

Pero primero, ¿que _son_ exactamente las PWA?

Son sitios web normales que toman ventaja de la funcionalidad de los navegadores modernos para mejorar la experiencia de uso con opciones y beneficios como si se tratara de una aplicación. Mira el [enfoque de Google](https://developers.google.com/web/progressive-web-apps/) de lo que debe ser una experiencia PWA.

Incluir un manifiesto a la aplicación web es uno de los tres generalmente aceptados [requerimientos básicos para una PWA](https://alistapart.com/article/yes-that-web-project-should-be-a-pwa#section1).


Citando a [Google](https://developers.google.com/web/fundamentals/web-app-manifest/):

> El manifiesto de una aplicación web es un simple archivo JSON que le dice al navegador acerca de tu aplicación web y como comportarse cuando se 'instale' en el dispositivo movil o de escritorio.

El [plugin Gatsby's manifest](/packages/gatsby-plugin-manifest/) configura Gatsby para crear un archivo `manifest.webmanifest` en cada sitio web compilado.

### ✋ Usando `gatsby-plugin-manifest`

1.  Instala el plugin:

```shell
npm install --save gatsby-plugin-manifest
```

2. Agrega un favicon para tu aplicación en `src/images/icon.png`. Para este tutorial puedes usar este [icono de ejemplo](https://raw.githubusercontent.com/gatsbyjs/gatsby/master/docs/tutorial/part-eight/icon.png), no debes disponer de uno. El icono es necesario para crear todas las imágenes del manifiesto. Para más información, mira la documentación [`gatsby-plugin-manifest`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-plugin-manifest/README.md).

3. Agrega el plugin al arreglo `plugins` en tu archivo `gatsby-config.js`.

```javascript:title=gatsby-config.js
{
  plugins: [
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `GatsbyJS`,
        short_name: `GatsbyJS`,
        start_url: `/`,
        background_color: `#6b37bf`,
        theme_color: `#6b37bf`,
        // Muestra el mensaje "Agregar a escritorio" y deshabilita la UI del navegador (incluido el botón "atrás")
        // ve https://developers.google.com/web/fundamentals/web-app-manifest/#display
        display: `standalone`,
        icon: `src/images/icon.png`, // Esta ruta es relativa a la raíz de el sitio web.
      },
    },
  ]
}
```

Es todo lo que necesitas para empezar a agregar un manifiesto a tu sitio web Gatsby. El ejemplo dado refleja una configuración base -- mira la [referencia de plugin](/packages/gatsby-plugin-manifest/?=gatsby-plugin-manifest#automatic-mode) para más opciones.

## Agrega soporte sin conexión

Otro requerimiento para que un sitio web califique como PWA es el uso de un [service worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API). Un "service worker" se ejecuta en segundo plano, decidiendo si ofrece recursos en línea o almacenados en la cache del navegador dependiendo del estado de conexión, permitiendo una experiencia agradable sin ella.

El [plugin Gatsby's offline](/packages/gatsby-plugin-offline/) hace que el sitio web Gatsby funcione sin conexión y sea mas resistente a malas condiciones de red, creando un "service worker" para tu sitio web.


### ✋ Usando `gatsby-plugin-offline`

1.  Instala plugin:

```shell
npm install --save gatsby-plugin-offline
```

2.  Agrega el plugin al listado de `plugins` en el archivo `gatsby-config.js`.

```javascript:title=gatsby-config.js
{
  plugins: [
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `GatsbyJS`,
        short_name: `GatsbyJS`,
        start_url: `/`,
        background_color: `#6b37bf`,
        theme_color: `#6b37bf`,
        // Muestra el mensaje "Agregar a escritorio" y deshabilita la UI del navegador (incluido el botón "atrás")
        // ve https://developers.google.com/web/fundamentals/web-app-manifest/#display
        display: `standalone`,
        icon: `src/images/icon.png`, // Esta ruta es relativa a la raíz de el sitio web.
      },
    },
    // highlight-next-line
    `gatsby-plugin-offline`,
  ]
}
```

Es todo lo que necesitas para iniciar con "service workers" en Gatsby.

> 💡 El plugin sin conexión (offline plugin) lo deberás listar _después_ del plugin manifiesto (manifest plugin), para que el plugin sin conexión pueda guardar en la cache del navegador el archivo creado `manifest.webmanifest`.

## Agregar metadatos a la página

Agregar metadatos a las páginas (como un título o descripción) es clave para ayudar aa motores de búsqueda como Google a entender tu contenido y decidir cuando mostrarte en sus resultados de búsqueda.

[React Helmet](https://github.com/nfl/react-helmet) es una biblioteca que provee una interfaz de componentes React para que administres la [cabecera de tus documentos HTML](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/head).

El plugin [gatsby-plugin-react-helmet](/packages/gatsby-plugin-react-helmet/) soporta renderizado en el servidor de toda la información agregada con React Helmet. Usando el plugin, los atributos agregados a React Helmet serán agregados a las páginas HTML que Gatsby compile.

### ✋ Usando `React Helmet` y `gatsby-plugin-react-helmet`

1.  Instala ambos paquetes:

```shell
npm install --save gatsby-plugin-react-helmet react-helmet
```

2.  Agrega el plugin al listado de `plugins` en el archivo `gatsby-config.js`.

```javascript:title=gatsby-config.js
{
  plugins: [
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `GatsbyJS`,
        short_name: `GatsbyJS`,
        start_url: `/`,
        background_color: `#6b37bf`,
        theme_color: `#6b37bf`,
        // Muestra el mensaje "Agregar a escritorio" y deshabilita la UI del navegador (incluido el botón "atrás")
        // ve https://developers.google.com/web/fundamentals/web-app-manifest/#display
        display: `standalone`,
        icon: `src/images/icon.png`, // Esta ruta es relativa a la raíz de el sitio web.
      },
    },
    `gatsby-plugin-offline`,
    // highlight-next-line
    `gatsby-plugin-react-helmet`,
  ]
}
```

3.  Utiliza `React Helmet` en tus páginas:

```jsx
import React from "react"
import { Helmet } from "react-helmet"

class Application extends React.Component {
  render() {
    return (
      <div className="application">
        {/* highlight-start */}
        <Helmet>
          <meta charSet="utf-8" />
          <title>My Title</title>
          <link rel="canonical" href="http://mysite.com/example" />
        </Helmet>
        ...
        {/* highlight-end */}
      </div>
    )
  }
}
```

> 💡 El ejemplo anterior es de la [documentación de React Helmet](https://github.com/nfl/react-helmet#example). ¡Revísalos para más información!

## Sigue haciéndolo mejor

En esta sección te hemos mostrado algunas herramientas especificas de Gatsby para mejorar el desempeño de tu sitio web y prepararlo para subirlo a producción.

Lighthouse es una herramienta estupenda para hacer mejoras a tu sitio y aprender -- ¡continua revisando los resultados detallados que te provee y sigue haciendo tu sitio web mejor!

## Siguientes pasos

### Documentación oficial

- [Documentación oficial](https://www.gatsbyjs.org/docs/): Mira nuestra documentación oficial para un _[Inicio rápido](https://www.gatsbyjs.org/docs/quick-start/)_, _[Guías detalladas](https://www.gatsbyjs.org/docs/preparing-your-environment/)_, _[Referencias de API](https://www.gatsbyjs.org/docs/gatsby-link/)_, y mucho más.

### Plugins oficiales

- [Plugins oficiales](https://github.com/gatsbyjs/gatsby/tree/master/packages): La lista completa de todos los plugins oficiales mantenidos por Gatsby.

### Inicializadores oficiales

1.  [Inicializador Gatsby por defecto (Gatsby's Default Starter)](https://github.com/gatsbyjs/gatsby-starter-default): Empieza tu proyecto con este modelo. Este inicializador básico genera los principales archivos de configuración que puedas necesitar. _[ejemplo funcionando](http://gatsbyjs.github.io/gatsby-starter-default/)_
2.  [Inicializador Gatsby para blogs (Gatsby's Blog Starter)](https://github.com/gatsbyjs/gatsby-starter-blog): Inicializador Gatsby para crear un asombroso y ultra rápido blog. _[ejemplo funcionando](http://gatsbyjs.github.io/gatsby-starter-blog/)_
3.  [Inicializador Gatsby Hola-Mundo (Gatsby's Hello-World Starter)](https://github.com/gatsbyjs/gatsby-starter-hello-world): Inicializador Gatsby con lo mínimo básico necesario para un sitio web Gatsby. _[ejemplo funcionando](https://gatsby-starter-hello-world-demo.netlify.com/)_

## Eso es todo amigos

Bueno, no del todo; solo para este tutorial. También hay [tutoriales adicionales](/tutorial/additional-tutorials/) para revisar más casos guiados.

Esto es solo el inicio. ¡Sigue adelante!

- ¿Construiste algo genial? Compártelo en Twitter, con el tag [#buildwithgatsby](https://twitter.com/search?q=%23buildwithgatsby), y [@mencionanos](https://twitter.com/gatsbyjs)!
- ¿Escribiste algún post genial acerca de lo que haz aprendido? ¡Compártelo también!
- ¡Colabora! Paseate por los [issues abiertos](https://github.com/gatsbyjs/gatsby/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) en el repo de gatsby y [vuélvete colaborador](/contributing/how-to-contribute/).

Revisa los docs de ["como contribuir"](/contributing/how-to-contribute/) para mas ideas.

Ansiamos ver lo que haces 😄.
