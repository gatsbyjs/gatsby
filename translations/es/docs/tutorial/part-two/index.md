---
title: Introduction al uso de Css en Gatsby
typora-copy-images-to: ./
---

¡Bienvenido a la segunda parte del tutorial de Gatsby!

## ¿Qué hay en este tutorial?

En esta parte, explorarás las opciones para diseñar los sitios web de Gatsby y profundizarás en el uso de los componentes React para construir sitios.

## Creando estilos globales

Cada sitio tiene algún tipo de estilo global. Esto incluye cosas como el sitio,
Tipografía y colores de fondo. Estos estilos establecen la sensación general del
sitio, al igual que el color y la textura de una pared establecen la sensación general de una habitación.

A menudo la gente usará algo como Bootstrap o Foundation para sus estiloss globales. El problema con estos, sin embargo, es que son difíciles de personalizar y no están diseñados para funcionar bien con los componentes React.

Para este tutorial, vamos a explorar una biblioteca de JavaScript llamada
[Typography.js](https://github.com/kyleamathews/typography.js) que genera
Estilos globales y funciona particularmente bien con Gatsby y React.


### Typography.js

Typography.js es una biblioteca de JavaScript que genera CSS tipográfico.

En lugar de configurar directamente el 'tamaño de fuente' de diferentes elementos HTML, dile a Typography.js cosas como tu `baseFontSize` y` baseLineHeight` deseados y basado en esto, genera la base CSS para todos tus elementos.

Esto hace que sea trivial cambiar el tamaño de fuente de todos los elementos en un sitio sin
Tener que modificar directamente las docenas de reglas CSS.

Usándolo se ve algo como esto:

```javascript
import Typography from "typography"

const typography = new Typography({
  baseFontSize: "18px",
  baseLineHeight: 1.45,
  headerFontFamily: [
    "Avenir Next",
    "Helvetica Neue",
    "Segoe UI",
    "Helvetica",
    "Arial",
    "sans-serif",
  ],
  bodyFontFamily: ["Georgia", "serif"],
})
```

## Plugins de Gatsby

Pero antes de poder volver a construir y probar Typography.js, hagamos
Un rápido desvío para hablar de plugins de Gatsby.

Probablemente estés familiarizado con la idea de los plugins. Muchos sistemas de soporte de software
añaden plugins personalizados para agregar nuevas funcionalidades o incluso modificar el funcionamiento principal del software.

Los plugins de Gatsby funcionan de la misma manera.

Los miembros de la comunidad (¡como tu!) Pueden contribuir con plugins (pequeñas cantidades de
Código JavaScript) que otros pueden usar al crear sitios Gatsby.

¡Ya hay docenas de plugins! Echa un vistazo a ellos en la
[sección de complementos del sitio](/plugins/).

Nuestro objetivo con los plugins de Gatsby es hacer que su instalación y uso sean sencillos. En casi todos los sitios de Gatsby, instalarás plugins. Mientras trabajas por el resto del tutorial, tendrás muchas oportunidades para practicar la instalación y el uso plugins.

## Instalando tu primer plugin de Gatsby

Comienza creando un nuevo sitio. En este punto, probablemente tenga sentido cerrar las ventanas de terminal que usamos para crear el tutorial-parte-uno para que no empieces accidentalmente a construir el tutorial-parte-dos en el lugar equivocado. Si no cierra el tutorial-part-one antes de crear el tutorial-part-two, verás que el tutorial-part-two aparece en localhost: 8001 en lugar de localhost: 8000.

Al igual que en la primera parte, abre una nueva ventana de terminal y ejecuta los siguientes comandos para crear un nuevo sitio de Gatsby en un directorio llamado `tutorial-part-two`. Luego, cambia a este nuevo directorio:

```shell
gatsby new tutorial-part-two https://github.com/gatsbyjs/gatsby-starter-hello-world
cd tutorial-part-two
```

este comando crea un sitio con la siguiente estructura.

```shell
├── package.json
├── src
│   └── pages
│       └── index.js
```

Esta es la configuración mínima para un sitio de Gatsby.

Para instalar un plugin, hay dos pasos. Primero, instalar el paquete NPM del plugin y, segundo, agrega el plugin al archivo `gatsby-config.js` de tu sitio.

Typography.js tiene un plugin de Gatsby, así que instálalo junto con algunos paquetes adicionales necesarios ejecutando:

```shell
npm install --save gatsby-plugin-typography react-typography typography
```

A continuación, en tu editor de código, crea un archivo en la raíz de tu carpeta de proyecto llamada `gatsby-config.js`.

Aquí es donde se agregan los plugins junto con otra configuración del sitio.

Copia lo siguiente en `gatsby-config.js`

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [`gatsby-plugin-typography`],
}
```

Gatsby lee el archivo de configuración del sitio al iniciar. Aquí, le dices que busque un plugin llamado `gatsby-plugin-typography`. Gatsby sabe que debe buscar plugins que sean paquetes NPM, por lo que encontrará el paquete que instalamos anteriormente.

Ahora ejecuta `gatsby develop`. Una vez que cargue el sitio, si inspeccionas el HTML generado con las herramientas de desarrollo de Chrome, verás que el plugin de tipografía agregó un elemento `<style>` al elemento `<head>` con su CSS generado.

![tipografía-estilos](../../../../../docs/tutorial/part-two/typography-styles.png)

Copia lo siguiente en tu `src/pages/index.js` para que puedas ver mejor el efecto de la tipografía CSS generada por Typography.js.

```jsx:title=src/pages/index.js
import React from "react"

export default () => (
  <div>
    <h1>Richard Hamming on Luck</h1>
    <div>
      <p>
        From Richard Hamming’s classic and must-read talk, “
        <a href="http://www.cs.virginia.edu/~robins/YouAndYourResearch.html">
          You and Your Research
        </a>
        ”.
      </p>
      <blockquote>
        <p>
          There is indeed an element of luck, and no, there isn’t. The prepared
          mind sooner or later finds something important and does it. So yes, it
          is luck.{" "}
          <em>
            The particular thing you do is luck, but that you do something is
            not.
          </em>
        </p>
      </blockquote>
    </div>
    <p>Posted April 09, 2011</p>
  </div>
)
```

Su sitio ahora debería verse así:

![typography-not-centre](../../../../../docs/tutorial/part-two/typography-not-centered.png))

Vamos a hacer una mejora rápida. Muchos sitios tienen una única columna de texto centrada en el medio de la página. Para crear esto, agregue los siguientes estilos al
`<div>` en `src/pages/index.js`.

![basic-typography-centered](../../../../../docs/tutorial/part-two/typography-centered.png)

Oh, esto está empezando a verse bien!

Lo que estás viendo aquí es el CSS que produce Typography.js por defecto. Sin embargo, puedes personalizarlo fácilmente. Vamos a hacer eso.

En tu sitio, crea un nuevo directorio en `src/utils`. En ese directorio, crea un archivo llamado `typography.js`. En ese archivo, agregue el siguiente código.

```javascript:title=src/utils/typography.js
import Typography from "typography"

const typography = new Typography({ baseFontSize: "18px" })

export default typography
```

Luego configura este módulo para que lo use `gatsby-plugin-typography` como su configuración en
tu archivo `gatsby-config.js`

```javascript{2..9}:title=gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography.js`,
      },
    },
  ],
}
```

Deten `gatsby develop` escribiendo <kbd> Ctrl + c </kbd> en la ventana del terminal donde se está ejecutando el proceso de desarrollo. Luego, ejecuta `gatsby develop` nuevamente para reiniciarlo. Esto permitirá que tu cambio de plugin tenga efecto.

Ahora, todos los tamaños de fuente de texto deben ser un poco más grandes. Intenta cambiar el `baseFontSize` por ` 24px` y luego `12px`. Todos los elementos se redimensionan, ya que su "tamaño de fuente" se basa en el "baseFontSize".

_Nota que si utilizas `gatsby-plugin-typography` con el iniciador predeterminado, debes eliminar el layout.css predeterminado utilizado por ese iniciador, ya que reemplaza el CSS de Typography.js

Existen
[muchos temas disponibles](https://github.com/KyleAMathews/typography.js#published-typographyjs-themes)
para typography.js. Prueba un par. En tu terminal, en la raíz de tu sitio, ejecuta:

```shell
npm install --save typography-theme-bootstrap typography-theme-lawton
```

Para usar el tema de botstrap, cambia tu código de typography por:

```javascript{2,4}:title=src/utils/typography.js
import Typography from "typography"
import bootstrapTheme from "typography-theme-bootstrap"

const typography = new Typography(bootstrapTheme)

export default typography
```

![typography-bootstrap](../../../../../docs/tutorial/part-two/typography-bootstrap.png)

Los temas también pueden agregar fuentes de Google. El tema de Lawton que instalamos junto con el tema de Bootstrap hace esto. Reemplaza tu código del módulo de typography con el siguiente, luego reinicia el servidor dev (necesario para cargar las nuevas fuentes de Google).

```javascript{2-3,5}:title=src/utils/typography.js
import Typography from "typography"
// import bootstrapTheme from "typography-theme-bootstrap"
import lawtonTheme from "typography-theme-lawton"

const typography = new Typography(lawtonTheme)

export default typography
```

![typography-lawton](../../../../../docs/tutorial/part-two/typography-lawton.png)

__Reto: _ Typography.js tiene más de 30 temas!
[Pruébalos en vivo](http://kyleamathews.github.io/typography.js) o echa un vistazo
[la lista completa](https://github.com/KyleAMathews/typography.js#published-typographyjs-themes) e intenta instalar uno en tu sitio actual de Gatsby.

## Componentes de CSS

Gatsby tiene una gran cantidad de opciones disponibles para componentes de estilos. En este tutorial, explorarás
Un método muy popular: los módulos CSS.

### CSS-in-JS

Si bien no cubriremos CSS-in-JS en este tutorial inicial, te alentamos a explorar las bibliotecas CSS-in-JS porque solucionan muchos de los problemas con el CSS tradicional y hacen que tus componentes React sean aún más inteligentes. Hay mini-tutoriales para dos bibliotecas, [Glamour](../../../../../docs/glamour/) y [Componentes de estilo](../../../../../docs/styled-components/). Echa un vistazo a los siguientes recursos para leer en segundo plano sobre CSS-in-JS:

[Christopher "vjeux" Chedeau's 2014 presentation that sparked this movement](https://speakerdeck.com/vjeux/react-css-in-js)
y
[Mark Dalgleish's more recent post "A Unified Styling Language"](https://medium.com/seek-blog/a-unified-styling-language-d0c208de2660).

### Módulos de CSS

Vamos a explorar **Módulos de CSS**.

Citando de
[la página de inicio del módulo CSS](https://github.com/css-modules/css-modules):

> Un **CSS Module** es un archivo CSS en el que todos los nombres de clase y animación tienen un alcance local por defecto.

Los módulos CSS son muy populares ya que te permiten escribir CSS como de costumbre pero con mucha más seguridad. La herramienta automáticamente hace que los nombres de las clases y las animaciones sean únicos para que no tengas que preocuparte por las colisiones entre los nombres de los selectores.

Los módulos CSS son altamente recomendados para aquellos que son nuevos en la construcción con Gatsby (y React en general).

Gatsby 'out of the box' con los módulos CSS.

Construye una página usando módulos CSS.

Primero, crea un nuevo componente `Container`. Crea un nuevo directorio en `src/components` y luego, en este nuevo directorio, crea un archivo llamado `container.js` y pega lo siguiente:

```javascript:title=src/components/container.js
import React from "react"
import containerStyles from "./container.module.css"

export default ({ children }) => (
  <div className={containerStyles.container}>{children}</div>
)
```

Notarás que importamos un archivo de módulos css llamado `container.module.css`. Vamos a hacer eso.

En el mismo directorio, crea el archivo `container.module.css` y pega en él:

```css:title=src/components/container.module.css
.container {
  margin: 3rem auto;
  max-width: 600px;
}
```

Luego, crea un nuevo componente de página creando un archivo en `src/pages/about-css-modules.js`:

```javascript:title=src/pages/about-css-modules.js
import React from "react"

import Container from "../components/container"

export default () => (
  <Container>
    <h1>About CSS Modules</h1>
    <p>CSS Modules are cool</p>
  </Container>
)
```

Si visita `http://localhost:8000/about-css-modules/`, su página debería tener el siguiente aspecto:

![css-modules-1](../../../../../docs/tutorial/part-two/css-modules-1.png)

Crea una lista de personas con nombres, avatares y biografías cortas en latín.

Primero, cree el archivo para el CSS en `src/pages/about-css-modules.module.css`. Notarás que el nombre del archivo termina con `.module.css` en lugar de` .css` como de costumbre. Así es como le dice a Gatsby que este archivo CSS debe procesarse como módulos CSS.

Pegue lo siguiente en el archivo:

```css:title=src/pages/about-css-modules.module.css
.user {
  display: flex;
  align-items: center;
  margin: 0 auto 12px auto;
}

.user:last-child {
  margin-bottom: 0;
}

.avatar {
  flex: 0 0 96px;
  width: 96px;
  height: 96px;
  margin: 0;
}

.description {
  flex: 1;
  margin-left: 18px;
  padding: 12px;
}

.username {
  margin: 0 0 12px 0;
  padding: 0;
}

.excerpt {
  margin: 0;
}
```

Ahora importa ese archivo a la página `about-css-modules.js` que creó anteriormente, agregando lo siguiente en las líneas 2 y 3.
(El código `console.log (estilos)` registra la importación resultante para que puedas ver cómo se ve el archivo procesado).

```javascript:title=src/pages/about-css-modules.js
import styles from "./about-css-modules.module.css"
console.log(styles)
```

Si abres la consola de desarrollador (por ejemplo, mediante las herramientas de desarrollador de Firefox o Chrome) en su navegador, verás:

![css-modules-console](../../../../../docs/tutorial/part-two/css-modules-console.png)

Si lo comparas con tu archivo CSS, verás que cada clase es ahora una clave en el objeto importado que apunta a una cadena larga, por ejemplo. `avatar` apunta a` about-css-modules-module --- avatar----hYcv`. Estos son los nombres de clase que generan los módulos CSS. Están garantizados para ser únicos en tu sitio. Y porqué
tienes que importarlos para usar las clases, nunca hay ninguna duda sobre dónde se está utilizando algún CSS.

Usa tus estilos para crear un componente `User`.

Cree el nuevo componente en línea en el componente de la página `about-css-modules.js`. La regla general es esta: si usas un componente en varios lugares de un sitio, debería estar en su propio archivo de módulo en el directorio `componentes`. Pero, si se usa solo en un archivo, créalo en línea.

Modifica el archivo `about-css-modules.js` para que se vea como sigue:

```jsx{7-19,25-34}:title=src/pages/about-css-modules.js
import React from "react"
import styles from "./about-css-modules.module.css"
import Container from "../components/container"

console.log(styles)

const User = props => (
  <div className={styles.user}>
    <img src={props.avatar} className={styles.avatar} alt="" />
    <div className={styles.description}>
      <h2 className={styles.username}>{props.username}</h2>
      <p className={styles.excerpt}>{props.excerpt}</p>
    </div>
  </div>
)

export default () => (
  <Container>
    <h1>About CSS Modules</h1>
    <p>CSS Modules are cool</p>
    <User
      username="Jane Doe"
      avatar="https://s3.amazonaws.com/uifaces/faces/twitter/adellecharles/128.jpg"
      excerpt="I'm Jane Doe. Lorem ipsum dolor sit amet, consectetur adipisicing elit."
    />
    <User
      username="Bob Smith"
      avatar="https://s3.amazonaws.com/uifaces/faces/twitter/vladarbatov/128.jpg"
      excerpt="I'm Bob smith, a vertically aligned type of guy. Lorem ipsum dolor sit amet, consectetur adipisicing elit."
    />
  </Container>
)
```

El resultado debería ser el diguiente:

![css-modules-final](../../../../../docs/tutorial/part-two/css-modules-final.png)

### Otras opciones de CSS

Gatsby admite casi todas las opciones de estilo posibles (si aún no hay un complemento para su opción de CSS favorita,
[please contribute one!](/docs/how-to-contribute/))

- [Sass](/packages/gatsby-plugin-sass/)
- [Emotion](/packages/gatsby-plugin-emotion/)
- [JSS](/packages/gatsby-plugin-jss/)
- [Stylus](/packages/gatsby-plugin-stylus/)
- y más!

## What's coming next?

Ahora continua con la [Parte tres](/tutorial/part-three/) del tutorial.
