---
title: Configurando el entorno de desarrollo
typora-copy-images-to: ./
---

Antes de comenzar a codificar, deberás familiarizarte con algunas tecnologías web centrales y asegurarte de haber instalado todas las herramientas de software requeridas.

## Descripción general de las tecnologías centrales

Ya no es necesario ser un experto. Si no lo eres, ¡no te preocupes! Obtendrás mucho a lo largo de esta serie de tutoriales; Estas son algunas de las principales tecnologías web que usarás al construir un sitio con Gatsby:

- **HTML**: un lenguaje de marcado que todos los navegadores web pueden entender. Sus siglas significan lenguaje de marcado de hipertexto. HTML le da a tu contenido web una estructura de información universal, definiendo cosas como encabezados, párrafos y más.
- **CSS**: un lenguaje de presentación utilizado para dar estilo al aspecto de tu contenido web (fuentes, colores, diseño, etc.).
- **JavaScript**: un lenguaje de programación que nos ayuda a hacer que la web sea dinámica e interactiva.
- **React**: una biblioteca de código (construida con JavaScript) para crear interfaces de usuario. Es el framework que Gatsby usa para construir páginas y estructurar contenido.
- **GraphQL**: un lenguaje de consulta; Un lenguaje de programación que le permite obtener datos en su sitio web. Es la interfaz que usa Gatsby para administrar los datos del sitio.

> 💡 (¡Opcional!) Para obtener una introducción completa de lo que es un sitio web, HTML y CSS, consulta “[**Creando tu primera página web**](https://learn.shayhowe.com/html-css/building-your-first-web-page/)”. Es un gran lugar para comenzar a aprender sobre la web, desde cero. Para obtener una introducción más práctica a [**HTML**](https://www.codecademy.com/learn/learn-html), [**CSS**](https://www.codecademy.com/learn/learn-css) y [**JavaScript**](https://www.codecademy.com/learn/introduction-to-javascript), echa un vistazo a los tutoriales de Codecademy. [**React**](https://reactjs.org/tutorial/tutorial.html) y [**GraphQL**](http://graphql.org/graphql-js/) también tienen sus propios tutoriales introductorios.

## familiarizándonos con la línea de comando

La línea de comando es una interfaz basada en texto que se usa para ejecutar comandos en tu computadora. (También lo verás a menudo como terminal. En este tutorial utilizaremos ambos de forma intercambiable). Es muy parecido a usar Finder en una Mac o Explorer en Windows. Finder y Explorer son ejemplos de interfaces gráficas de usuario (GUI en inglés). La línea de comando es una forma poderosa, basada en texto para interactuar con tu computadora.

Tómese un momento para ubicar y abrir la interfaz de línea de comando (CLI) para su computadora. (Según el sistema operativo que esté utilizando, consulte [**instrucciones para Mac**](http://www.macworld.co.uk/feature/mac-software/how-use-terminal-on-mac-3608274/), o [**instrucciones para Windows**](https://www.quora.com/How-do-I-open-terminal-in-windows)).

> 💡 Para obtener una excelente introducción al uso de la línea de comandos, consulta el [**tutorial de la línea de comandos de Codecademy**](https://www.codecademy.com/courses/learn-the-command-line/lessons/navigation/exercises/your-first-command) para usuarios de Mac y Linux, y [**este tutorial**](https://www.computerhope.com/issues/chusedos.htm) para usuarios de Windows. (Incluso si eres usuario de Windows, la primera página del tutorial de Codecademy es una lectura valiosa, ya que explica cuál es la línea de comandos, no solo cómo interactuar con ella).

## Instalar Node.js

Node.js es un entorno que puede ejecutar código JavaScript. Gatsby está construido con Node.js. Para comenzar a trabajar con Gatsby, deberás tener una versión reciente instalada en tu computadora.

### ⌚ Descargar Node.js

Visita el sitio [**Node.js**](https://nodejs.org/) y sigue las instrucciones para descargar e instalar la versión recomendada para tu sistema operativo. Una vez que hayas seguido los pasos de instalación, asegúrate de que todo esté instalado correctamente:

### ✋ Comprueba la instalación de Node.js

1. Abre tu terminal.
2. Ejecuta `node --version`. (Si eres nuevo en la línea de comando, "ejecutar un `comando` "significa" algo escribe: `node --versión` en el símbolo del sistema, y presionar la tecla Enter". A partir de aquí, esto es lo que queremos decir con "ejecutar" `comando`").
3. Ejecuta `npm --version`.

La salida de cada uno de esos comandos debe ser un número de versión. (¡Es posible que sus versiones no coincidan con las que se muestran a continuación!) Si al ingresar esos comandos no aparece un número de versión, regresa y asegúrate de haber instalado Node.js.

![Check node and npm versions in terminal](../../../../../docs/tutorial/part-zero/01-node-npm-versions.png)

## familiarizándonos con npm

npm es un administrador de paquetes de JavaScript. Un paquete es un módulo de código que puedes elegir incluir en tus proyectos. ¡Si acabas de descargar e instalar Node.js, se instaló npm con él!

npm tiene tres componentes distintos: el sitio web npm, el registro npm y la CLI npm (interfaz de línea de comando).

- En el sitio web de npm, puedess explorar qué paquetes de JavaScript están disponibles en el registro npm.
- El registro npm es una gran base de datos de información sobre paquetes JavaScript disponibles en npm.
- Una vez que hayas identificado el paquete que deseas, puedes usar el CLI de npm para instalarlo en su proyecto. El CLI de npm es lo que habla con el registro: generalmente solo interactúa con el sitio web de npm o el CLI de npm.

> 💡 Puedes revisar la introducción a npm, “[**Que es npm?**](https://docs.npmjs.com/getting-started/what-is-npm)”.

## Instalar el CLI de Gatsby

La herramienta CLI de Gatsby te permite crear rápidamente nuevos sitios con Gatsby y ejecutar comandos para desarrollar sitios de Gatsby. Es un paquete de npm publicado. Puede instalar el CLI de Gatsby desde el registro npm, utilizando el CLI de npm.

### ✋ Instalar la herramienta Gatsby CLI

1. Navega hacia la terminal.
2. Ejecuta `npm install --global gatsby-cli`.

> 💡 Si no puedes instalar correctamente debido a un problema de permisos, es posible que desees verificar la [documentos npm sobre la fijación de permisos](https://docs.npmjs.com/getting-started/fixing-npm-permissions), o [esta guía](https://github.com/sindresorhus/guides/blob/master/npm-global-without-sudo.md).

Hay una serie de cosas que ocurren aquí

```bash
npm install --global gatsby-cli
```

- Estamos usando el CLI npm para instalar el CLI de Gatsby. `npm install` es el comando utilizado para instalar paquetes.
- Al instalar paquetes npm, puedes instalarlos globalmente o en un proyecto específico. (Aprenderemos sobre esto último, más adelante). La bandera `--global` indica que queremos la primera opción, para instalarla globalmente. Esto significa que nuestro paquete estará disponible para nosotros en nuestra computadora, fuera del contexto de un proyecto específico.
- `gatsby-cli` es el nombre exacto con el que está registrado nuestro paquete deseado en el registro de [**npm**](https://www.npmjs.com/package/gatsby-cli).

### ✋ Verifica la instalación del CLI de Gatsby

1.  Abre tu terminál.
2.  Ejecuta `gatsby --version`.
3.  Ejecuta `gatsby --help`.

![Check gatsby version in terminal](../../../../../docs/tutorial/part-zero/02-gatsby-version.png)

Si se instala con éxito, `gatsby --version` debería devolver un número de versión, y al ejecutar `gatsby --help` se mostrarán diferentes comandos disponibles usando la herramienta `gatsby-cli`.

## Crear un sitio

Ahora usemos la herramienta gatsby-cli para crear tu primer sitio de Gatsby. Con la herramienta, puedes usar "iniciadores", o sitios parcialmente construidos con alguna configuración predeterminada, para ayudarte a moverte más rápido al crear un cierto tipo de sitio. El iniciador "Hello World" que vamos a usar aquí es un iniciador con los elementos esenciales necesarios para un sitio de [Gatsby](/).

### ✋ Crear un sitio de Gatsby

1. Abre tu terminal.
2. Ejecuta `gatsby new hello-world https://github.com/gatsbyjs/gatsby-starter-hello-world`. (_Nota: Dependiendo de la velocidad de descarga, la cantidad de tiempo que esto tomará variará. En aras de la brevedad, el gif siguiente se pausó durante parte de la instalación_).
3. Ejecuta `cd hello-world`.
4. Ejecuta `gatsby develop`.

<video controls="controls" autoplay="true" loop="true">
  <source type="video/mp4" src="../../../../../docs/tutorial/part-zero/03-create-site.mp4"></source>
  <p>Sorry! You browser doesn't support this video.</p>
</video>

Que acaba de pasar?

```bash
gatsby new hello-world https://github.com/gatsbyjs/gatsby-starter-hello-world
```

- Comenzando con `gatsby` decimos, '¡oye, quiero usar la herramienta gatsby-cli!'
- `new` es un comando de gatsby para crear un nuevo proyecto de Gatsby.
- Aquí, `hello-world` es un título arbitrario: puedes elegir cualquier cosa. La herramienta CLI colocará el código de tu nuevo sitio en una nueva carpeta llamada "hello-world".
- Por último, el URL de Github especificado apunta a un repositorio de código que contiene el código de inicio que deseas utilizar. Si aún no estás familiarizado con git y Github, puedes [obtener más información aquí](https://try.github.io/).

```bash
cd hello-world
```

- Esto dice 'Quiero cambiar de directorio (`cd`) a la subcarpeta "hello-world". Siempre que desees ejecutar comandos para tu sitio, debes estar en el contexto de ese sitio (es decir, tu terminal debe apuntar al directorio donde vive el código de tu sitio).

```bash
gatsby develop
```

- Este comando inicia un servidor de desarrollo. Podrás ver e interactuar con tu nuevo sitio en un entorno de desarrollo local (en tu computadora, no publicado en Internet).

### ✋ Ve tu sitio localmente

abre una nueva tab en tu navegador y dirígete a [**http://localhost:8000**](http://localhost:8000/).

![Check homepage](../../../../../docs/tutorial/part-zero/04-home-page.png)

Felicidades! ¡Este es el comienzo de tu primer sitio de Gatsby! 🎉

Podrás visitar el sitio localmente en [**_http://localhost:8000_**](http://localhost:8000/) mientras tu servidor de desarrollo se esté ejecutando. (Ese es el proceso que comenzó ejecutando el comando `gatsby develop`). Para detener la ejecución de ese proceso (o "dejar de ejecutar el servidor de desarrollo"), regresa a la ventana de tu terminal, manten presionada la tecla "control" y luego presiona "c" (ctrl-c). Para comenzar de nuevo, ejecuta `gatsby develop` otra vez!

## Configura un editor de código

Un editor de código es un programa diseñado específicamente para editar código de computadora. Hay muchos grandes por ahí; Si no has trabajado anteriormente con un editor de código, recomendamos el editor utilizado en este tutorial - [**VS Code**](https://code.visualstudio.com/).

### ✋ Descarga VS Code

Visita el [sitio de VS Code](https://code.visualstudio.com/#alt-downloads) y descarga la versión adecuada para tu plataforma.

### ✋ Instala el plugin Prettier

También recomendamos usar [Prettier](https://github.com/prettier/prettier) - Prettier es una herramienta que ayuda a formatear tu código, manteniéndolo constante (¡y ayudando a evitar errores!).

Puedes usar Prettier directamente en tu editor usando el plugin [plugin Prettier VS Code](https://github.com/prettier/prettier-vscode):

1. Abre la vista de extensiones en VS Code (Ver => Extensiones)
2. Busca "Prettier - Code formater"
3. Haz clic en "Instalar". Después de la instalación, se te pedirá que reinicies VS Code para habilitar la extensión.

> 💡 Si no estás usando VS Code, consulta los documentos de Prettier para ver las [instrucciones de instalación](https://prettier.io/docs/en/install.html) u [otras integraciones del editor](https://prettier.io/docs/en/editors.html).

## ➡️ ¿Qué sigue?

En resumen, en esta sección tu:

- Instalaste y aprendiste sobre Node.js y la herramienta CLI de npm
- Instalaste y aprendiste sobre la herramienta Gatsby CLI
- Generaste un nuevo sitio de Gatsby utilizando la herramienta Gatsby CLI
- Descargaste un editor de código
- Instalaste un formateador de código llamado Prettier

Ahora, pasemos a [**Conoce los bloques de construcción de Gatsby**](/tutorial/part-one/).
