---
título: Cómo contribuir
---

## Contribución

Queremos contribuir con Gatsby para que sea divertido, agradable y educativo para todos. Las contribuciones van más allá de los <tt>pull request</tt> y <tt>commits</tt>; Estamos encantados de recibir una variedad de otras contribuciones, incluyendo las siguientes:

- Bloguear, hablar sobre el tema, o crear tutoriales sobre las muchas caracteristicas de Gatsby. Mencione @gatsbyjs en Twitter y / o envíe un correo electrónico a shannon [arroba] gatsbyjs [punto] com para que podamos darle consejos y sugerencias (si las quiere :) ) y ayudarle a correr la voz. Agregue las publicaciones de su blog y los videos de las charlas a nuestra página [Asombroso Gatsby] (/ docs / awesome-gatsby /).
- Enviar nueva documentación; los títulos en _cursiva_ en gatsbyjs.org son <tt>stubs</tt> y necesitan contribuciones
- Twittear sobre cosas que construyes con @gatsbyjs (asegúrate de @ mencionarnos!)
- Enviar documentos actualizados, mejoras, diseños o correcciones de errores
- Enviar correcciones ortográficas o gramaticales
- Agregar unidades o pruebas funcionales
- Ayudar con [problemas de GitHub](https://github.com/gatsbyjs/gatsby/issues) -- especialmente determinando si un problema persiste o es reproducible
- [Reportar errores o problemas encontrados](/docs/how-to-file-an-issue/)
- Buscar a Gatsby en [Discord](https://discordapp.com/invite/jUFVxtB) o [Spectrum](https://spectrum.chat/gatsby-js) y ayudar a alguien más que lo necesite
- ¡Enseñar a otros cómo contribuir al repositorio de Gatsby!

Si estás preocupado o no sabes por dónde empezar, siempre puedes comunicarte con Shannon Soper (@shannonb_ux) en Twitter o simplemente presentar el problema en GitHub y una persona encargada del mantenimiento podrá ayudarlo a orientarse.

¿Quieres dar una charla de Gatsby? ¡Nos encantaría revisar tus ideas para la charla! ¡Puedes enviarlo por correo electrónico a shannon [arroba] gatsbyjs [punto] com y podemos darte consejos o sugerencias!

### Crea tus propios complementos y cargadores

Si crea un cargador (`loader`) o un complemento (`plugin`), nosotros <3 que lo suba en código abierto (`Open source`) y lo ponga en npm. Para más información sobre cómo crear complementos, por favor lea la documentación [complementos](https://github.com/gatsbyjs/gatsby/blob/master/docs/plugins) y la [especificación del API](https://github.com/gatsbyjs/gatsby/blob/master/docs/api-specification)

### Contribuciones al repositorio

Gatsby usa un patrón de "monorepo" para administrar sus muchas dependencias y depende de
lerna y/o yarn para configurar el repositorio para el desarrollo activo.

Puede instalar la última versión de Gatsby siguiendo estos pasos:

- Copie el repositorio, navegue a su directorio.
- Asegúrese de tener la última versión de yarn instalada (>= 1.0.2)
  https://yarnpkg.com/en/docs/install
- Instale dependencias usando `yarn run bootstrap` en la raíz del repositorio.

Los pasos habituales para contribuir son:

- Enlace (`fork`) el [repositorio oficial](https://github.com/gatsbyjs/gatsby).
- Copie tu enlace: copia de git `git@github.com:<su-usuario>/gatsby.git`
- Prepare el repositorio e instale las dependencias: `ejecuta yarn bootstrap`
- Asegúrese de que las pruebas le estén funcionando: `yarn test`
- Cree una rama con este tema: `git checkout -b topics/new-feature-name`
- Ejecute `npm run watch` desde la raíz del repositorio para ver los cambios en el código fuente de los paquetes y guarde estos cambios sobre la marcha a medida que trabaja. Tenga en cuenta que el comando visualizar puede consumir muchos recursos. Para limitarlo a los paquetes en los que está trabajando, agregue un indicador de alcance, como `npm run watch -- --scope={gatsby,gatsby-cli}`. Para ver solo un paquete, ejecute`npm run watch -- --scope=gatsby`.
- Instale [gatsby-dev-cli](/packages/gatsby-dev-cli/) globalmente: `yarn global add gatsby-dev-cli`
- Ejecute `yarn install` en cada uno de los sitios con los que está probando
- Para cada uno de los sitios de prueba Gatsby, use el comando `gatsby-dev` allí para copiar
  los archivos creados de su copia extraida de Gatsby. Te vigilará tus cambios
  a los paquetes de Gatsby y los copiara en el sitio web. Para ver instrucciones más detalladas:
  [gatsby-dev-cli README](/packages/gatsby-dev-cli/)
- Agregue pruebas y código para sus cambios.
- Una vez que haya terminado, asegúrese de que todas las pruebas aún funcionen: `yarn test`
- Realize el commit y llévelo a su enlace (`fork`).
- Cree un `pull request` desde su `branch`.

### Contribuir con la documentación.

Gatsby, como era de esperar, utiliza Gatsby en la documentación de su sitio web.

Si desea agregar/modificar cualquier documentación de Gatsby,debe ir a la
[carpeta docs en GitHub](https://github.com/gatsbyjs/gatsby/tree/master/docs) y utilizar el editor de archivos para editar y luego ver una vista previa de tus cambios. GitHub luego te permite
que hagas el cambio a un commit y subas a PR justo en la interfaz de usuario. Esta es la _manera más facil_
en la que puedes colaborar con el proyecto!

Sin embargo, si desea hacer más cambios en el sitio web -eso es, cambiar
diseños, agregar secciones/páginas- siga los pasos a continuación.Puede armar su
propia instancia del sitio web Gatsby y hacer/previsualizar sus cambios antes de subir un <tt>pull request</tt>.

- Copie su repositorio y diríjase a `/www`
- Utilice `yarn` para instalar todas las dependencias del sitio web.
- Utilice `gatsby develop` para obtener una vista previa del sitio web en `http://localhost:8000`
- El archivo _Markdown_ para la documentación _live_ en la `/docs` carpeta. Haga
  adiciones o modificaciones aquí.
- Asegúrese de verificar que tu gramática sea la más apropiada.
- Haga el _commit_ y llévelo a su _fork_.
- Cree un <tt>pull request</tt> desde su <tt>branch</tt>.
