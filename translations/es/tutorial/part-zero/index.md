---
title: Configura tu Entorno de Desarrollo
typora-copy-images-to: ./
disableTableOfContents: true
---

Antes de comenzar a crear tu primer sitio Gatsby, debes familiarizarte con algunas tecnologías web básicas y asegurarte de haber instalado todas las herramientas de software necesarias.

## Familiarízate con la línea de comandos

La línea de comandos es una interface de texto para ejecutar comandos en tu ordenador. Muchas veces nos referimos a ella como la terminal. En este tutorial lo llamaremos de ambas formas. Es muy parecido a usar el Finder en Mac o el Explorador en Windows. Finder y Explorer son ejemplos de Interfaz gráfica de usuario (GUI). La línea de comandos es una manera poderosa, basada en texto, para interactuar con tu ordenador.

Asegúrate de encontrar y abrir la interfaz de línea de comandos (CLI) de tu ordenador. Dependiendo de que sistema operativo estés usando, mira [**instrucciones para Mac**](http://foro-mac.com.ar/tutorial-como-usar-la-terminal-en-mac/), [**instrucciones para Windows**](https://www.xataka.com/basics/comandos-basicos-para-dar-tus-primeros-pasos-consola-windows-cmd) or [**instrucciones para Linux**](https://openwebinars.net/blog/La-guia-definitiva-para-aprender-a-usar-la-terminal-de-Linux/).

## Instalar Homebrew para Node.js

Para instalar Gatsby y Node.js, es recomendable usar [Homebrew](https://brew.sh/). Un poco de configuración al inicio te puede salvar de muchos dolores de cabeza más adelante!

Cómo instalar y verificar Homebrew en tu ordenador:

1. Abre la terminal
1. Mira si Homebrew está instalado ejecuntando `brew -v`. Deberías ver "Homebrew" y el número de versión.
1. Si no lo está, descárga e instala [Homebrew siguiendo las instrucciones (en inglés)](https://docs.brew.sh/Installation) para tu sistema operativo (Mac, Linux o Windows).
1. Una vez hayas instalado Homebrew, repite el paso 2 para verificarlo.

### Usuarios Mac: Instalar Xcode Command Line Tools

1. Abre la terminal.
1. En una Mac, instalamos Xcode Command line tools ejecutando `xcode-select --install`.
   1. Si eso falla, descárgalas [directamente del sitio web de Apple](https://developer.apple.com/download/more/), después de iniciar sesión con tu Cuenta de Developer de Apple.
1. Después de que el proceso de instalación haya empezado, se te solicitará nuevamente aceptar las licencias de las herramientas que se van a descargar.

## ⌚ Instala Node.js y npm

Node.js es un entorno que puede ejecutar código JavaScript fuera de un navegador web. Gatsby fue creado con Node.js. Para comenzar a utilizar Gatsby, debes tener instalada una versión reciente en tu ordenador.

_Note: La versión mínima soportada de Gatsby es Node 8, pero puedes usar una versión mas reciente._

1. Abre la terminal.
1. Ejecuta `brew update` para asegurarte de tener la última versión de Homebrew.
1. Ejecuta el siguiente comando para instalar Node y npm todo en uno: `brew install node`

Una vez hayas seguido los pasos para la instalación, asegurate que todo esté instalado correctamente:

### Verifica la instalación de Node.js

1.  Abre la terminal.
2.  Ejecuta `node --version`. (Si eres nuevo con la línea de comandos, "ejecuta `comando`" quiere decir "escribe `comando` en la ventana de comandos, y presiona la tecla Enter". De ahora en adelante, ésto es lo que nos referimos con "ejecuta `comando`").
3.  Ejecuta `npm --version`.

La respuesta de ambos comandos debe ser el número de versión. Las versiones que veas puede que no sean las mismas que te mostramos a continuación! Si despues de ejecutar esos comandos no te muestran las versiones, vuelve y asegúrate que hayas instalado Node.js.

![Verifica las versiones de Node.js y npm](01-node-npm-versions.png)

## Instala Git

Git es un software de control de versiones distribuido y de software libre diseñado para gestionar proyectos pequeños o grandes de una manera rápida y eficiente. Cuando instalas un "starter" de Gatsby, Gatsby usa Git internamente para descargar e instalar los ficheros requeridos para tu proyecto. Necesitarás Git instalado para configurar tu primer sitio web Gatsby.

Los pasos para descargar e instalar Git dependen de tu sistema operativo. Sigue los pasos para el tuyo:

- [Instala Git para macOS](https://filisantillan.com/como-instalar-git/#mac)
- [Instala Git para Windows](https://filisantillan.com/como-instalar-git/#windows)
- [Instala Git para Linux](https://filisantillan.com/como-instalar-git/#linux)

## Usando la Gatsby CLI

La línea de comandos de Gatsby (CLI) te permite crear rápidamente nuevos sitios web Gatsby y ejecutar comandos para el desarrollo de sitios web Gatsby. es un paquete npm público.

Gatsby CLI está disponible via npm y debe ser instalado de manera global en tu sistema con el comando `npm install -g gatsby-cli`.

Para ver los comandos disponibles, ejecuta `gatsby --help`.

![Echa un vistazo a los comandos disponibles con Gatsby](05-gatsby-help.png)

> 💡 Si no puedes ejecutar la Gatsby CLI por un problema de permisos, quizás te interese mirar [la documentación de npm para solucionar el problema de los permisos (inglés)](https://docs.npmjs.com/getting-started/fixing-npm-permissions), o [ésta guía (inglés)](https://github.com/sindresorhus/guides/blob/master/npm-global-without-sudo.md).

## Crea un sitio web con Gatsby

Ahora ya estás listo para usar la línea de comandos de Gatsby (Gatsby CLI) para crear tu primer sitio web con Gatsby. Usándola, puedes descargar "plantillas" ("starters") (sitios parcialmente construidos con alguna configuración predeterminada) que te ayudarán a ir más rápido creando cierto tipo de sitios. La plantilla "Hello World" que usarás contiene los elementos básicos necesarios para un sitio web Gatsby.

1. Abre la terminal.
2. Ejecuta `gatsby new hello-world https://github.com/gatsbyjs/gatsby-starter-hello-world`. (_Nota: Dependiendo de tu velocidad de descarga, el tiempo que ésto tome puede variar. Por razones de brevedad, el siguiente gif se detuvo durante parte de la instalación_)
3.  Ejecuta `cd hello-world`.
4.  Ejecuta `gatsby develop`.

<video controls="controls" autoplay="true" loop="true">
  <source type="video/mp4" src="./03-create-site.mp4"></source>
  <p>Sorry! You browser doesn't support this video.</p>
</video>

¿Qué ha pasado?

```shell
gatsby new hello-world https://github.com/gatsbyjs/gatsby-starter-hello-world
```

- `new` es un comando de Gatsby para crear un nuevo proyecto Gatsby.
- `hello-world` es un titulo arbitrario — puede ser cualquier cosa. La CLI pondrá el código de tu nuevo sitio web en una nueva carpeta con el nombre "hello-world".
- Por último, la URL de Github especificada apunta a un repositorio de código que almacena la plantilla (starter) que quieres utilizar.

```shell
cd hello-world
```

- Esto quiere decir 'Quiero cambiar de directorios (`cd`) al subdirectorio “hello-world”'. Cada vez que quieras ejecutar comandos en tu sitio web, necesitas estar en el contexto del sitio (en otras palabras, la terminal tiene que estar apuntando al directorio donde está el código).

```shell
gatsby develop
```

- Éste comando inicia un servidor de desarrollo. Serás capaz de ver e interactuar con tu nuevo sitio web en un entorno de desarrollo — local (en tu ordenador, no publicado a internet).

### Mira tu sitio web en local

Abre una nueva pestaña en tu navegador y ve a [**http://localhost:8000**](http://localhost:8000/).

![Página principal](04-home-page.png)

¡Felicidades! ¡Esto es el inicio de tu primer sitio hecho con Gatsby! 🎉

Puedes ver tu sitio web en local en [**_http://localhost:8000_**](http://localhost:8000/) mientras tu servidor de desarrollo esté activo. Este es el proceso que has iniciado cuando ejecutaste el comando `gatsby develop`. Para detener el proceso (o cerrar el servidor de desarrollo), vuelve a la terminal, mantén presionada la tecla "control" y presiona la tecla "c" (ctrl-c). ¡Para iniciarlo nuevamente, ejecuta `gatsby develop` otra vez!

**Nota:** Si estás en un entorno virtual (VM) como `vagrant` y/o te gustaría ejecutara el entorno de desarrollo desde tu dirección IP local, ejecuta `gatsby develop -- --host=0.0.0.0`. Ahora, el servidor de desarrollo escuchará tanto 'localhost' como tu dirección IP local.

## Configura un editor de código

Un editor de código es un programa diseñado específicamente para editar código. Hay opciones muy buenas disponibles.

> Si nunca has trabajado con un editor de código antes, te recomendamos [**VS Code**](https://code.visualstudio.com/), simplemente porque las capturas de pantalla usadas en el tutorial fueron hechas en VS Code, con lo que te será más familar.

### Descarga VS Code

La documentación de Gatsby a veces incluye capturas de pantalla de editores de código; estas capturas muestran VS Code, asi que si no tienes un editor de código preferido aún, usando VS Code te asegurarás que lo que ves en tu pantalla se verá como las capturas en el tutorial y la documentación. Si has escogido usar VS Code, visita el [sitio oficial de VS Code](https://code.visualstudio.com/#alt-downloads) y descarga la versión adecuada para tu sisstema operativo.

### Instala el plugin de Prettier

También recomendamos usar [Prettier](https://github.com/prettier/prettier), una herramienta que ayuda a formatear tu código y evitar errores.

Puedes usar Prettier directamente en tu editor de código usando el [plugin de Prettier para VS Code](https://github.com/prettier/prettier-vscode):

1. Abre la vista de las extensiones en VS Code (View => Extensions).
2. Busca "Prettier - Code formatter".
3. Presiona "Instalar". (Después de la instalación, te sugerirá reiniciar VS Code para habilitar la extensión. Nuevas versiones de VS Code habilitarán automáticamente la extensión después de descargarla.)

> 💡 Si no estás usando VS Code, visita la documentación de Prettier por [instructiones de instalación](https://prettier.io/docs/en/install.html) u [otras integraciones](https://prettier.io/docs/en/editors.html).

## ➡️ Qué sigue?

Resumiendo, en ésta sección tú:

- Aprendimos acerca de la línea de comandos y cómo usarla
- Instalamos y aprendimos Node.js y npm CLI, el sistema de control de versiones Git y Gatsby CLI
- Creamos un nuevo sitio web Gatsby usando la Gatsby CLI
- Ejecutamos el servidor de desarrollo Gatsby y visitamos tu sitio en local
- Descargamos un editor de código
- Instalamos un formateador de código llamado Prettier

Ahora, sigamos a [**conociendo los bloques de construcción de Gatsby**](/tutorial/part-one/).

## Referencias

## Descripción general de las tecnologías principales

No es necesario ser un experto en ésto ahora — ¡Si no lo eres, no te preocupes! Aprenderás mucho durante el transcurso de ésta serie de tutoriales. Estas son algunas de las tecnologías web más comunes y que usarás para crear sitios web Gatsby:

- **HTML**: Lenguaje de marcado que todo navegador web puede entender. Son las siglas en inglés de HyperText Markup Language. HTML le da al contenido web una estructura informativa universal, definiendo cosas como encabezados, párrafos y más.
- **CSS**: Un lenguaje de presentación utilizado para diseñar la apariencia de su contenido web (fuentes, colores, diseño, etc.). Son las siglas en inglés de Cascading Style Sheets.
- **JavaScript**: Un lenguaje de programación que nos ayuda a hacer que la web sea dinámica e interactiva.
- **React**: Una librería de código (creada con JavaScript) para construir interfaces de usuario. Es el framework que Gatsby usa para crear páginas y estructurar contenido.
- **GraphQL**: Un lenguaje de consulta que le permite extraer datos en su sitio web. Es la interfaz que Gatsby usa para gestionar los datos del sitio.

## Qué es un sitio web?

Para una introducción completa de lo que es un sitio web, --incluida una introducción a HTML y CSS--, mira "[**Building your first web page**](https://learn.shayhowe.com/html-css/building-your-first-web-page/)". Es un gran sitio para comenzar a aprender sobre la web. Para una introducción más práctica a [**HTML**](https://www.codecademy.com/learn/learn-html), [**CSS**](https://www.codecademy.com/learn/learn-css) y [**JavaScript**](https://www.codecademy.com/learn/introduction-to-javascript), consulta los tutoriales de Codecademy. [**React**](https://es.reactjs.org/tutorial/tutorial.html) y [**GraphQL**](http://graphql.org/graphql-js/) también tienen sus propios tutoriales introductorios.

## Aprende más sobre la línea de comandos

Para una excelente introducción al uso de la línea de comandos, consulte el [**tutorial de la línea de comandos de Codecademy**](https://www.codecademy.com/courses/learn-the-command-line/lessons/navigation/exercises/your-first-command) para usuarios de Mac y Linux, y [**este tutorial**](https://www.computerhope.com/issues/chusedos.htm) para usuarios de Windows. Incluso si es un usuario de Windows, la primera página del tutorial de Codecademy es una lectura valiosa. Explica qué es la línea de comandos, no solo cómo interactuar con ella.

## Aprende más sobre npm

npm es un administrador de paquetes de JavaScript. Un paquete es un módulo de código que puedes elegir incluir en tus proyectos. Si acabas de descargar e instalar Node.js, ¡npm se instaló también!

npm tiene tres componentes distintos: el sitio web de npm, el registro de npm y la interfaz de línea de comandos (CLI) npm.

- En el sitio web de npm, puede examinar qué paquetes de JavaScript están disponibles en el registro de npm.
- El registro de npm es una gran base de datos de información sobre los paquetes JavaScript disponibles en npm.
- Una vez que haya identificado el paquete que desea, puede usar la npm CLI para instalarlo en su proyecto o globalmente (como otras herramientas de CLI). La CLI de npm es lo que habla con el registro — generalmente solo interactuas con el sitio web o la CLI de npm.

> 💡 Mira la Introducción a npm, “[**Qué es npm?**](https://docs.npmjs.com/getting-started/what-is-npm)”.

## Aprende más sobre Git

No tienes que saber Git para completar este tutorial, pero es una herramienda muy util. Si estás interesado en aprender sobre control de versiones, Git y Github, mira el [Git Handbook](https://guides.github.com/introduction/git-handbook/).
