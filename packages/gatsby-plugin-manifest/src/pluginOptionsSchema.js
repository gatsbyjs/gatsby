const defaultConfig = {
  legacy: true,
  theme_color_in_head: true,
  cache_busting_mode: `query`,
  crossOrigin: `anonymous`,
  include_favicon: true,
}

export default function pluginOptionSchema({ Joi }) {

  /* Descriptions copied from or based on documentation at https://developer.mozilla.org/en-US/docs/Web/Manifest
  *  
  * Currently based on https://www.w3.org/TR/2019/WD-appmanifest-20190911/
  */
  const platform = Joi.string()
    .optional()
    .empty(``)
    .description(`The platform on which the application can be found.`)

  const FingerPrint = Joi.object().keys({
    type: Joi.string()
      .required()
      .description(`syntax and semantics are platform-defined`),
    value: Joi.string()
      .required()
      .description(`syntax and semantics are platform-defined`),
  })
  const ImageResource = Joi.object().keys({
    sizes: Joi.string()
      .optional()
      .description(`A string containing space-separated image dimensions`),
    src: Joi.string()
      .required()
      .description(
        `The path to the image file. If src is a relative URL, the base URL will be the URL of the manifest.`
      ),
    type: Joi.string().description(
      `A hint as to the media type of the image. The purpose of this member is to allow a user agent to quickly ignore images with media types it does not support.`
    ),
    purpose: Joi.string()

      .valid(`badge`, `maskable`, `any`)
      .description(
        `Defines the purpose of the image, for example if the image is intended to serve some special purpose in the context of the host OS.`
      ),
    platform: platform,
  })

  const ExternalApplicationResource = Joi.object().keys({
    platform: platform.required(),
    url: Joi.string()
      .uri()
      .required()
      .description(`The URL at which the application can be found.`),
    id: Joi.string()
      .required()

      .description(
        `The ID used to represent the application on the specified platform.`
      ),
    min_version: Joi.string()
      .optional()
      .description(
        `The minimum version of the application that is considered related to this web app.`
      ),
    fingerprints: Joi.array()
      .optional()
      .items(FingerPrint)
      .description(
        `Each Fingerprints represents a set of cryptographic fingerprints used for verifying the application.`
      ),
  })

  const ServiceWorkerRegistrationObject = Joi.object()
    .optional()
    .keys({
      src: Joi.string()
        .required()
        .description(` URL representing a service worker. `),
      scope: Joi.string()
        .optional()
        .description(`service worker's associated scope URL`),
      type: Joi.string()
        .optional()
        .valid(`classic`, `module`)
        .default(`classic`)
        .description(`Service workers type`),
      update_via_cache: Joi.string()
        .optional()
        .valid(`imports`, `all`, `none`)
        .default(`imports`)
        .description(
          `Determines the update via cache mode for the service worker.`
        ),
    })
    .description(
      `represents a service worker registration for the web application. `
    )

  const WebAppManifest = Joi.object().keys({
    background_color: Joi.string()
      .optional()
      .description(
        `The background_color member defines a placeholder background color for the application page to display before its stylesheet is loaded.`
      ),
    categories: Joi.array()
      .items(Joi.string().empty(``))
      .optional()
      .description(
        `The categories member is an array of strings defining the names of categories that the application supposedly belongs to.`
      ),
    description: Joi.string()
      .optional()
      .description(
        `The description member is a string in which developers can explain what the application does. `
      ),
    dir: Joi.string()
      .optional()
      .valid(`auto`, `ltr`, `rtl`)
      .default(`auto`)
      .description(
        `The base direction in which to display direction-capable members of the manifest.`
      ),
    display: Joi.string()
      .optional()
      .valid(`fullscreen`, `standalone`, `minimal-ui`, `browser`)
      .default(`browser`)
      .description(
        `The display member is a string that determines the developers’ preferred display mode for the website`
      ),
    iarc_rating_id: Joi.string()
      .guid()
      .optional()
      .description(
        `The iarc_rating_id member is a string that represents the International Age Rating Coalition (IARC) certification code of the web application.`
      ),
    icons: Joi.array()
      .optional()
      .items(ImageResource)
      .description(
        `The icons member specifies an array of objects representing image files that can serve as application icons for different contexts.`
      ),
    lang: Joi.string()
      .optional()
      .description(
        `The lang member is a string containing a single language tag.`
      ),
    name: Joi.string()
      .optional()
      .description(
        `The name member is a string that represents the name of the web application as it is usually displayed to the user.`
      ),
    orientation: Joi.string()
      .optional()
      .valid(
        `any`,
        `natural`,
        `landscape`,
        `landscape-primary`,
        `landscape-secondary`,
        `portrait`,
        `portrait-primary`,
        `portrait-secondary`
      )
      .description(
        `The orientation member defines the default orientation for all the website's top-level browsing contexts`
      ),
    prefer_related_applications: Joi.boolean()
      .optional()
      .default(false)
      .description(
        `The prefer_related_applications member is a boolean value that specifies that applications listed in related_applications should be preferred over the web application.`
      ),
    related_applications: Joi.array()
      .optional()
      .items(ExternalApplicationResource)
      .description(
        `The related_applications field is an array of objects specifying native applications that are installable by, or accessible to, the underlying platform.`
      ),
    scope: Joi.string()
      .optional()
      .description(
        `The scope member is a string that defines the navigation scope of this web application's application context.`
      ),
    screenshots: Joi.array()
      .optional()
      .description(
        `The screenshots member defines an array of screenshots intended to showcase the application.`
      ),
    serviceworker: ServiceWorkerRegistrationObject,
    short_name: Joi.string()
      .optional()
      .description(
        `The short_name member is a string that represents the name of the web application displayed to the user if there is not enough space to display name.`
      ),
    start_url: Joi.string()
      .optional()
      .description(
        `The start_url member is a string that represents the start URL of the web application.`
      ),
    theme_color: Joi.string()
      .optional()
      .description(
        `The theme_color member is a string that defines the default theme color for the application.`
      ),
  })

  return WebAppManifest.concat(
    Joi.object()
      .keys({
        icon: Joi.string(),
        legacy: Joi.boolean().default(defaultConfig.legacy),
        theme_color_in_head: Joi.boolean().default(
          defaultConfig.theme_color_in_head
        ),
        cache_busting_mode: Joi.string()
          .valid(`none`, `query`, `name`)
          .default(defaultConfig.cache_busting_mode),
        crossOrigin: Joi.string().default(defaultConfig.crossOrigin),
        include_favicon: Joi.boolean().default(defaultConfig.include_favicon),
        icon_options: ImageResource.keys({
          src: Joi.string().forbidden(),
          sizes: Joi.string().forbidden(),
        }),

        localize: Joi.array()
          .items(
            WebAppManifest.keys({
              lang: Joi.required(),
              start_url: Joi.required(),
            })
          )
          .description(`Used for localizing your WebAppManifest`),
      })
      .or(`icon`, `icons`)
      .with(`localize`, `lang`)
  )
}
